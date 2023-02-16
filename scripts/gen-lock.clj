#!/usr/bin/env bb


(defn getDirectory [name] 
    ( clojure.java.io/file ( str ( "." name ) ))
)


  (->> "./TypeScript"
       getDirectory
       file-seq
       println
  )

    (->> "./JavaScript"
       getDirectory
       file-seq
       println
  )

  