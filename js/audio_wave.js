var $audioWave = $(".audio-wave");

var w = $audioWave.width();
var h = $audioWave.height();
var x_scale = d3.scaleLinear().range([0, w]).domain([0, 1]);
var y_scale = d3.scaleLinear().range([h, 0]).domain([0, 1]);

var line = d3.line()
		.x(function(d) { 
			return x_scale(d.x);})
		.y(function(d) { 
			return y_scale(d.y); 
		})

var graph = d3.select(".audio-wave").append("svg:svg")
		      .attr("width", w)
		      .attr("height", h)
		      .append("svg:g")		      
graph.append("svg:path").attr("class", "line").attr("d", line([{x: 0, y:0}, {x:1, y:1}]));

var set_domain = function(data_xy){
	x_scale.domain(d3.extent(data_xy, function(d){ return d.x}));
	// y_scale.domain([-1, 1]); //d3.extent(data_xy, function(d){ return d.y})
	var y_range = d3.extent(data_xy, function(d){ return d.y})
	y_scale.domain([ Math.min(-0.1, y_range[0]), Math.max(0.1, y_range[1]) ]); //

};

var plot_d3_wave = function(data_xy) {		
	set_domain(data_xy);
	var svg = d3.select("body").transition();
	svg.select(".line")
        .duration(0)
        .attr("d", line(data_xy));
}

var plotWave = function(wave) {	
    let found_good_ind = 0;
    for (let i = 0; i < wave.length - 1; i++){
      if (wave[i] < 0 && wave[i + 1] >= 0){
        found_good_ind = i;
        break;
      }
    }
    found_good_ind = Math.min(found_good_ind, wave.length - 500);
    
    wave_short = wave.slice(found_good_ind, found_good_ind + 500);
    data_xy  = [];
    for (let i = 0; i < wave_short.length; i++){
      data_xy.push({x: i, y: wave_short[i]});
    }
    plot_d3_wave(data_xy);
    console.log(data_xy)
}
