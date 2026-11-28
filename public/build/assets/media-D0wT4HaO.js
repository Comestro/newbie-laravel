function r(t){return!t||typeof t!="string"?null:t.startsWith("http://")||t.startsWith("https://")||t.startsWith("/")||t.startsWith("blob:")||t.startsWith("data:")?t:`/storage/${t}`}export{r};
