1. annotation object should have a updated timestamp for edited annotaions.
2. texts that have edited annotation should show somekind of indicator.(not sure what for)
3. 现在想到了可以不在highlightext里同时match， 可以在resumeText每个组件render的时候就先检查annotationlist里哪些textid和当前要render的段落id一样，生成一个新的只对这个段落适用的annotationlist segment，这样highlightText就只用match 文本内容了）
