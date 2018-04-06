import * as d3 from 'd3';
import * as Utils from '../utils';

const xPadding = 0, yPadding = 10;
const height = 420 - yPadding * 2;
const width = 500 - xPadding * 2;
const canvasHeight = 200;

const section = d3.select('#water-double-source');
const svg = section.select('svg')
	.attr('width', 500)
	.attr('height', 420);
const graph = svg.append('g');

const resolution = 5;
const halfResolution = Math.floor(resolution / 2);

const canvas = section.select('canvas')
	.style('margin-top', yPadding + 'px')
	.style('margin-left', xPadding + 'px')
	.attr('height', canvasHeight / resolution)
	.attr('width', width / resolution)
	.style('transform-origin', '0 0')
	.style('transform', `scale(${resolution})`);
const context = canvas.node().getContext('2d');

let distance = 50;

const waveOne = {
	amplitude: 0.5,
	frequency: 0.5,
	x: width / 2 - distance/2,
	y: canvasHeight / 2
};

const waveTwo = {
	amplitude: 0.5,
	frequency: 0.5,
	x: width / 2 + distance/2,
	y: canvasHeight / 2
};

const velocity = 40;
const maxAmplitude = 2;

function displacement (x, y, elapsed, sources) {
	let value = 0;
	for (let source of sources) {
		const dist = Math.sqrt((source.x - x) ** 2 + (source.y - y) ** 2);
		value += source.amplitude * Math.sin(2 * Math.PI * source.frequency * (dist / velocity - elapsed)) / Math.max(dist, 1);
	}
	return value *= 50;
}

const waveScale = d3.scaleLinear().domain([-maxAmplitude, maxAmplitude]).range([0, 1]);

const canvasToSvgYScale = d3.scaleLinear().domain([0, canvasHeight]).range([yPadding, canvasHeight + yPadding]);
const graphYScale = d3.scaleLinear().domain([-maxAmplitude, maxAmplitude]).range([yPadding + canvasHeight + 10, yPadding + height]);
const graphXScale = d3.scaleLinear().range([xPadding, width + xPadding]);

const probeArrow = svg.append('line')
	.attr('stroke', Utils.colors.black)
	.attr('stroke-width', '2')
	.attr('marker-end', 'url(#arrow-end-black)');

const probe = svg.append('circle')
	.attr('cx', 50).attr('cy', 50)
	.attr('r', 4)
	.attr('fill', Utils.colors.yellow)
	.attr('stroke', 'black')
	.attr('stroke-width', 2)
	.call(d3.drag()
		.on("drag", function (d) {
			probe.attr('cx', d3.event.x)
				.attr('cy', d3.event.y);
		})
		.on("end", function (d) {
			probe.attr('cx', d3.event.x)
				.attr('cy', d3.event.y);
		})
	);



const probeXAxis = graph.append('line')
	.attr('stroke', Utils.colors.grey)
	.attr('stroke-width', '2')
	.attr('stroke-dasharray', '5, 5')
	.attr('x1', graphXScale(0)).attr('y1', graphYScale(0)).attr('x2', graphXScale(1)).attr('y2', graphYScale(0));

let probeData = [];

Utils.createSlider(section.select('.one .slider-row.amplitude'), val => { waveOne.amplitude = val; });
Utils.createSlider(section.select('.one .slider-row.frequency'), val => { waveOne.frequency = val; });
Utils.createSlider(section.select('.two .slider-row.amplitude'), val => { waveTwo.amplitude = val; });
Utils.createSlider(section.select('.two .slider-row.frequency'), val => { waveTwo.frequency = val; });
Utils.createSlider(section.select('.both .slider-row.distance'), val => { 
	waveOne.x = width / 2 - val / 2;
	waveTwo.x = width / 2 + val / 2;
});

const maxTime = 5;

const line = d3.line()
	.x(d => { return graphXScale(d[0]); })
	.y(d => { return graphYScale(d[1]); });

let linePath = graph.append('path').datum(probeData)
	.attr('d', line)
	.attr('fill', 'none')
	.attr('stroke', Utils.colors.yellow)
	.attr('stroke-width', '2');

function render (elapsed) {
	if (elapsed < 100) probeData = [];
	elapsed = elapsed / 1000;
	context.clearRect(0, 0, width, height);
	
	const probeX = probe.attr('cx');
	const probeY = canvasToSvgYScale.invert(probe.attr('cy'));

	probeData.push([elapsed, displacement(probeX, probeY, elapsed, [waveOne, waveTwo])]);
	graphXScale.domain([elapsed, probeData[0][0]]);
	linePath.datum(probeData).attr('d', line);

	probeArrow.attr('x1', probeX).attr('y1', probe.attr('cy'))
		.attr('x2', graphXScale(probeData[probeData.length - 1][0]) + 5)
		.attr('y2', graphYScale(probeData[probeData.length - 1][1]) - 5);

	if (elapsed > maxTime) probeData.shift();

	for (let i = 0; i < width / resolution; i++) {
		for (let j = 0; j < canvasHeight / resolution; j++) {
			const value = displacement(i * resolution + halfResolution, j * resolution + halfResolution, elapsed, [waveOne, waveTwo]);
			context.fillStyle = d3.interpolateBlues(waveScale(value));
			context.fillRect(i, j, 1, 1);
		}
	}
}

Utils.createTimer(svg.node(), render);