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

(defn plugin-jsdocs [pth] 
  (let [ [_ & rst] (->> (re-seq jsdoc-regex (slurp pth))
                      (map (comp str->jsdoc str/trim first)) 
                      (filter (comp (partial = "plugin") :tag first))
                      first)] 

    (let [desc (take-while string? rst)
          more-tags (take-while :tag (drop (inc (count desc)) rst))]
      {
        :desc desc
        :tags more-tags
       } 
      )))

(def base "https://raw.githubusercontent.com/sern-handler/awesome-plugins/main/plugins/")

