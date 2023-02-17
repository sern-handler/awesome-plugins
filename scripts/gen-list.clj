(require '[cheshire.core :as json])
	
(defn directory [name]
  (io/file (str "./" name)))

(defn make-link [lang]
  (fn [name] (str "https://raw.githubusercontent.com/sern-handler/awesome-plugins/main/" lang "/" name)))
	
(defn name-without-extension [name]
  (if-let [last-dot-index (str/last-index-of name ".")]
    (subs name 0 last-dot-index)
    name))
	
(defn file-names [dir-name]
  (->>
   (directory dir-name)
   file-seq
   (filter #(.isFile %))
   (map #(.getName %))))
	
	
(defn file-links-and-basenames [dir]
  (let [base-link (make-link dir)]
    (mapv #(zipmap [:link :name] ((juxt base-link name-without-extension) %))
          (file-names dir))))
	
(def file-info-map (juxt keyword file-links-and-basenames))
	
(def json
  (into {} (map file-info-map ["JavaScript" "TypeScript"])))


(json/generate-stream json (io/writer "pluginlist.json") { :pretty true })

(println "\nGenerated Plugins!")
