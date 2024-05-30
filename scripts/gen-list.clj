(defn alpha? [ch] (Character/isLetter ch))
(defn >>alpha [in] (apply str (take-while alpha? in)))

(defn >>line [in] (apply str (take-while #(not= % \newline) in)))

(defn str->jsdoc [string] 
  (when (str/starts-with? string "/**")
    (loop [[fst & rest] (subs string 3) sol true;start-of-line
           res []]
      (when (some? fst)
          (cond  (str/blank? (str fst)) (recur rest sol res)
                 (= \@ fst) (let [out  (>>alpha rest) outct (count  out)
                                  line (>>line (drop outct rest))]
                                (recur (drop (+ outct (count line)) rest) true 
                                       (conj res {:tag out :line line})))
                 (= \* fst) (if (= (first rest) \/) res (recur rest (not sol) res))
                 :else (let [line (>>line rest)] (recur (drop (count line) rest) true (conj res (str fst line)))))))))


(def jsdoc-regex 
  #"[ \t]*\/\*\*\s*\n([^*]*(\*[^/])?)*\*\/")


(defn copy+md5 [source sink]
  (let [digest (java.security.MessageDigest/getInstance "MD5")]
    (with-open [input-stream  (io/input-stream source)
                digest-stream (java.security.DigestInputStream. input-stream digest)
                output-stream (io/output-stream sink)]
      (io/copy digest-stream output-stream))
    (format "%032x" (BigInteger. 1 (.digest digest)))))

(def base "https://raw.githubusercontent.com/sern-handler/awesome-plugins/main/plugins/")
(println  (->> (file-seq (io/file "./plugins"))
               (filter  #(.isFile %))
               (map (fn [file] 
                      (let [fname (fs/file-name file)
                            jsdocs (first  (keep str->jsdoc (re-find jsdoc-regex (slurp (str "./plugins/" fname)))))]
                        jsdocs
                        #_{ :name (first (str/split (fs/file-name file) #"\.")) 
                          :link (str base (fs/file-name file))
                          :hash (copy+md5 file (java.io.OutputStream/nullOutputStream)) 
                          
                          })))))

