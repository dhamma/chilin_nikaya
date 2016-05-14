/* get a list of sutta from section_id 5*/

var url="http://www.chilin.edu.hk/edu/report_section.asp?section_id=5"
var request=require("request");
var pages=[];

request({url},function(err,header,body){
	body.replace(/report_section_detail\.asp\?section_id=(\d+)&id=(\d+)/g,function(m,section_id,id){
		if (["59","60","61","62","64"].indexOf(section_id)>-1) {
			pages.push("section_id="+section_id+"&id="+id);
		}
	});

	require("fs").writeFileSync("urls.txt",pages.join("\n"),"utf8");
	console.log("number of pages",pages.length,", saved in urls.txt");
});