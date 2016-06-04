var fs=require("fs");
var files=fs.readFileSync("file.lst","utf8").split(/\r?\n/);
//files.length=1;
var writeToDisk=true;
var replaceUnicode=function(content){
	return content.replace(/&#(\d+);/g,function(m,m1){
		return String.fromCharCode(parseInt(m1));
	});
}

var replaceEntity=function(content){
	content=content.replace(/&ntilde;/g,"ñ");
	return content;
}
var clears=[
/<SPAN style="FONT-FAMILY:[^>]+?>/g,
/\n<p id=".+?">　　<\/p>/g,
/<table width="100%" border="0" cellspacing="0">/g,
/<td align="right">/g,
/<\/?tr>/g,
/<\/?td>/g,
/<\/table>/g,
/<strong>頁<\/strong>.+|/g,
/<SPAN lang=EN-GB>/g,
/<SPAN lang=ZH-TW>/g,
/<SPAN style="mso-ansi-language: EN-US">/g,
/<SPAN style="mso-special-character: footnote">/g,
/<SPAN style="mso-ansi-language: EN-US" lang=EN-US>/g,
'<?xml:namespace prefix = o ns = "urn:schemas-microsoft-com:office:office" /><o:p></o:p>',
/<P style="MARGIN: 0in 0in 0pt" class=MsoFootnoteText>/g,
/<P style="TEXT-JUSTIFY: inter-ideograph; TEXT-ALIGN: justify; MARGIN: 0cm 0cm 0pt" class=MsoFootnoteText>/g,
'<P style="MARGIN: 0in 0in 0pt" class=MsoFootnoteText><SPAN class=MsoFootnoteReference><SPAN style="mso-special-character: footnote"></ndef>',

]

var replacendef=function(content){
	content=content.replace(/<\/P><P>(\d+)\. ?/g,function(m,m1){
		return '</ndef>\n<ndef n="'+m1+'">';
	});

	content=content.replace(/<SPAN class=MsoFootnoteReference>(\d+)/g,function(m,m1){
		return '</ndef>\n<ndef n="'+m1+'">';
	});

	var p1=content.indexOf('<p id="1">');
	var p2=content.lastIndexOf('<p id="1">');
	if (p2>p1) {
		content=content.substr(0,p2)+'<ndef n="1">'+content.substr(p2+10);
	}
	return content;
}

var replacePnum=function(content){

}
var getBody=function(content,fn){
	var start=content.indexOf('<td class="subtitle">');
	var end=content.lastIndexOf('<td class="subtitle">');
	if (start===-1 || end===start) {
		console.log("wrong content",fn);
		exit;
	}
	return content.substring(start,end).replace(/\r?\n/g,"\n");
}
var processfile=function(fn){
var content=fs.readFileSync("html/"+fn,"utf8");
	var content=getBody(content,fn);
	content=replaceEntity(content);
	content=replaceUnicode(content);
	content=content.replace(/<br id="(.+?)">　*?(\d+)\. ?/g,function(m,m1,m2){
		return '</p>\n<p id="'+m2+'">';
	});

	content=content.replace(/<br id="(.+?)">　*/g,function(m,m1){
		return '</p>\n<p id="'+m1+'">';
	});

	for (var i=0;i<clears.length;i++) {
		content=content.replace(clears[i],"");
	}

	content=replacendef(content);

	content=content.replace(/&nbsp;/g,"");
	content=content.replace(/<SPAN>/g,"");
	content=content.replace(/<\/SPAN>/g,"");
	content=content.replace(/<\/P>/g,"");
	content=content.replace(/ +/g," ");
	content=content.replace(/\n /g,"\n");
	content=content.replace(/\n+/g,"\n");
	content=content.replace(/<\/I><I>/g,"");

	var getsid=function(fn){
		var nikaya=fn.substr(0,2);;
		if (nikaya=="dn"||nikaya=="mn") {
			var m=content.match(/<td class="subtitle">(\d+)/);
			if (m && m[1]) {
				content=content.replace(/<td class="subtitle">(\d+)/,function(m,sid){
					return '<sid n="'+sid+'"/>';
				})
				return nikaya+parseInt(m[1]);
			} else return fn;
		} else {
			return fn;
		}
	}

	if (writeToDisk) {
		var chilinfn=fn.substring(0,fn.length-5);
		var targetfn="genxml/"+(getsid(chilinfn,content)||chilinfn)+".xml";
		console.log("write to",targetfn,chilinfn);
		fs.writeFileSync(targetfn,content,"utf8");
	}
}


files.forEach(processfile);