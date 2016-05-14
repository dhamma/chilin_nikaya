/* get html from www.chilin.edu.hk */

var fs=require("fs");
var urls=fs.readFileSync("urls.txt","utf8").split("\n");
var now=0;
var request=require("request");
var iconv=require("iconv-lite");
var nikaya={"59":"dn","60":"mn","61":"sn","62":"an","64":"kn"};

var prefix="http://www.chilin.edu.hk/edu/report_section_detail.asp?page_id=1:0&";
var download=function(){
	if (!urls[now])return;
	console.log(now,urls.length,"downloading",urls[now]);
	request({url:prefix+urls[now],encoding:null},function(err,header,body){
		if (!err){
			var utf8 = iconv.decode(new Buffer(body), "big5");
			utf8=utf8.replace("charset=big5","charset=utf8");
			var fn=urls[now].replace(/section_id=(\d+)+&id=(\d+)/g,function(m,m1,m2){
				return "html/"+nikaya[m1]+"."+m2+".html";
			});
			console.log("save to",fn);
			fs.writeFileSync(fn,utf8,"utf8");
			now++;
			setTimeout(function(){
				download();
			},500);				
		}
	});
}

download();