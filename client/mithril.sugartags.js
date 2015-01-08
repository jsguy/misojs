//	Mithril sugar tags.
//	Copyright (C) 2014 jsguy (Mikkel Bergmann)
//	MIT licensed
(function(context){
	context.m = context.m || {};
	context.m.sugarTags = {};
	var arg = function(l1, l2){
			var i;
			for (i in l2) {if(l2.hasOwnProperty(i)) {
				l1.push(l2[i]);
			}}
			return l1;
		}, 
		tagList = ["A","ABBR","ACRONYM","ADDRESS","AREA","ARTICLE","ASIDE","AUDIO","B","BDI","BDO","BIG","BLOCKQUOTE","BODY","BR","BUTTON","CANVAS","CAPTION","CITE","CODE","COL","COLGROUP","COMMAND","DATALIST","DD","DEL","DETAILS","DFN","DIV","DL","DT","EM","EMBED","FIELDSET","FIGCAPTION","FIGURE","FOOTER","FORM","FRAME","FRAMESET","H1","H2","H3","H4","H5","H6","HEAD","HEADER","HGROUP","HR","HTML","I","IFRAME","IMG","INPUT","INS","KBD","KEYGEN","LABEL","LEGEND","LI","LINK","MAP","MARK","META","METER","NAV","NOSCRIPT","OBJECT","OL","OPTGROUP","OPTION","OUTPUT","P","PARAM","PRE","PROGRESS","Q","RP","RT","RUBY","SAMP","SCRIPT","SECTION","SELECT","SMALL","SOURCE","SPAN","SPLIT","STRONG","STYLE","SUB","SUMMARY","SUP","TABLE","TBODY","TD","TEXTAREA","TFOOT","TH","THEAD","TIME","TITLE","TR","TRACK","TT","UL","VAR","VIDEO","WBR"],
		lowerTagCache,
		i,
		//	Set "localSugarTags" on mithril to avoid global scope
		scope = context.m.localSugarTags? context.m.sugarTags: context;

	//	Create sugar'd functions in the required scope
	for (i in tagList) {if(tagList.hasOwnProperty(i)) {
		(function(tag){
			var lowerTag = tag.toLowerCase();
			scope[tag] = function(){
				return (context.m.e? context.m.e: context.m).apply(this, arg([lowerTag], arguments));
			};
		}(tagList[i]));
	}}

	//	Lowercased sugar tags
	context.m.sugarTags.lower = function(){
		if(!lowerTagCache) {
			lowerTagCache = {};
			//	Create lowercase sugar'd function cache
			for (i in tagList) {if(tagList.hasOwnProperty(i)) {
				(function(tag){
					var lowerTag = tag.toLowerCase();
					lowerTagCache[lowerTag] = function(){
						return (context.m.e? context.m.e: m).apply(this, arg([lowerTag], arguments));
					};
				}(tagList[i]));
			}}
		}
		return lowerTagCache;
	};

}(window));