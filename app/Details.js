import * as d3 from 'd3';
import Timeline from './Timeline';

function Details(){
	let W, H, M = {t:10,r:10,b:10,l:10};
	const formatTime = d3.timeFormat("%B %d, %Y");
	let detailsNode = document.getElementById('details')
	detailsNode.innerHTML = ''

	function exports(selection){
		let arr = selection.datum()?selection.datum():[];
		W = W || selection.node().clientWidth - M.l - M.r;
		H = H || selection.node().clientHeight - M.t - M.b;
	
		detailsNode.innerHTML = `${formatTime(new Date(arr.start))} - ${formatTime(new Date(arr.end))}`;

	};//-->END exports()

	exports.on = function(event, callback){
		dis.on(event, callback);
		return this;
	}

	return exports;
}//-->END Details()

export default Details;