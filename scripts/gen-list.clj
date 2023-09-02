

(require '[babashka.http-client :as http]
         '[babashka.fs :as fs])


(defn directory [name]
  (io/file (str "./" name)))

(defn make-link [name] 
  (str "https://raw.githubusercontent.com/sern-handler/awesome-plugins/main/plugins/" name))

(defn name-without-extension [name]
  (if-let [last-dot-index (str/last-index-of name ".")]
    (subs name 0 last-dot-index)
    name))

(defn read-lines [file] 
  (fs/read-all-lines file))

; remove not jsdoc lines
(defn remove-non-jsdoc [lines]
  ( ->> lines 
    (filter #(re-find #"^\s*\*|/\*\*|\*/" %)))) 

(defn into-jsdoc-content [lines]
  "get jsdoc from lines of file"
  ( ->> lines
    remove-non-jsdoc
    (map #(str/replace % #"^\s*\*(\s*)|\/\*\*(\s*)|\*\/" "$1"))))

(defn parse-author [line] 
  ( -> line 
    (str/replace #"@author" "")
    (str/trim)))

(defn group-doc [line] 
  (cond 
    (str/includes? line "@plugin")  {:plugin ""}
    (str/includes? line "@author")  {:author (parse-author line)}
    (str/includes? line "@example") {:example ""}
    (str/includes? line "@end") {:end "" }
    (str/includes? line "@version") {:version (-> line 
                                                     (str/replace #"@version" "")
                                                     (str/trim))}
    :else {:unknown line}
  ))

(defn get-description [file-data, kyword]
  "description will be the first section of unknown lines, up until an author tag"
  (split-with (comp not kyword) file-data))

(defn combine-lines [acc cur]
    (str acc "\n" cur))

(defn accumulate-multiple [acc cur] 
  (let [authors (:author cur)]
    (conj acc cur)))
  
(defn file-data [plugin-name]
  "gets all jsdoc content. Transforms into lazy seq of data"
  (let [file (io/file (str "./plugins/" plugin-name))
        ; We start a plugin metadata block. 
        ; this will transform the first JSDOC block that 
        ; starts with a @plugin tag
        lines (drop-while (comp not :plugin) (->> (read-lines file) 
                                                  into-jsdoc-content
                                                  (map group-doc)))
        ; description of plugin should come next, up until the first author tag appears
        [description, remaining] (get-description lines :author)
        ; get authors, and then the version of plugin should appear. 
        [authors, [version, & remaining2]] (get-description remaining :version)]
        ; transform into map
        {:description (reduce combine-lines "" (map :unknown description))
         :version (:version version)
         :author (reduce accumulate-multiple [] (map :author authors))
         :example (reduce combine-lines "" (map :unknown ( ->> remaining2 
                                                               (take-while (comp not :end)))))}
    ))

(defn get-filename [file] 
  (.getName file))

(defn copy+md5 [source sink]
  (let [digest (java.security.MessageDigest/getInstance "MD5")]
    (with-open [input-stream  (io/input-stream source)
                digest-stream (java.security.DigestInputStream. input-stream digest)
                output-stream (io/output-stream sink)]
      (io/copy digest-stream output-stream))
    (format "%032x" (BigInteger. 1 (.digest digest)))))


(defn generate-content [dir-name]
  (->>
   (file-seq (directory dir-name))
   (filter #(.isFile %))
   (map (fn [file]
          (let [ 
                fname (get-filename file)
                file-data (file-data fname)]
            (conj (hash-map
                    :name (name-without-extension fname) 
                    :link (make-link fname)
                    :hash (copy+md5 file (java.io.OutputStream/nullOutputStream)))
              file-data ))))))

(def json (generate-content "./plugins") )


(json/generate-stream json (io/writer "pluginlist.json") { :pretty true })

(println "Generated Plugins!")
