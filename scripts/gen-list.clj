(require '[cheshire.core :as json])

(defn directory [name]  
  (io/file (str "./" name)))

(defn makeLink [lang name] 
  (str "https://raw.githubusercontent.com/sern-handler/awesome-plugins/main/" lang "/" name))

(defn nameNoExtension [name]
   (subs name 0 (- (.length name) 3)) 
  )
(def JavaScript 
    ( ->>  
    (directory "JavaScript")
    file-seq 
    (filter #( .isFile %))
    (map #( .getName %))
    doall
  ))


(def TypeScript 
    ( ->>  
    (directory "TypeScript")
    file-seq 
    (filter #( .isFile %))
    (map #( .getName %))
    doall
  ))

(println "Found Files:")
(run! println (map nameNoExtension TypeScript) )


(def JSMap 
    (into [] (for [x JavaScript]
      { :link (makeLink "JavaScript" x) :name (nameNoExtension x) }
     ))
)

(def TSMap 
    (into [] (for [x TypeScript]
      { :link (makeLink "TypeScript" x) :name (nameNoExtension x) }
    ))
)

(def Json 
  { :TypeScript TSMap :JavaScript JSMap }
)

(json/generate-stream Json (io/writer "pluginlist.json") { :pretty true })

(println "\nGenerated Plugins!")
