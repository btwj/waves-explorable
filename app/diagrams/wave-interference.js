import * as d3 from 'd3';
import * as Utils from '../utils';

const section = d3.select('#wave-interference');
const svg = section.select('svg.interference')
	.attr('width', 500)
	.attr('height', 440)
	.append('g');

const padding = 10;
const height = 440 - padding * 4;
const width = 500 - padding * 2;

const x = d3.scaleLinear()
	.domain([0, 1]).range([padding + 20, padding + width]);
const yScales = {};
yScales.waveOne = d3.scaleLinear()
	.domain([1, -1]).range([padding, padding + height / 4]);
yScales.waveTwo = d3.scaleLinear()
	.domain([1, -1]).range([padding * 2 + height / 4, padding * 2 + 2 * height / 4]);
yScales.resultantWave = d3.scaleLinear()
	.domain([2, -2]).range([padding * 3 + 2 * height / 4, height + padding * 3]);

const groups = {};

const velocity = 0.00010;

const waveOne = {
	amplitude: 0.5,
	phaseDifference: 0
}

const waveTwo = {
	amplitude: 0.5,
	phaseDifference: 0
}

let frequency = 0.0005;

const wave = (x, t, properties) => {
	const wavelength = velocity / frequency;
	return properties.amplitude * Math.sin(Math.PI * 2 * (x / wavelength - frequency * t) - properties.phaseDifference);
}

const samples = d3.range(0, 1, 0.005);
const displacementSamples = d3.range(0, 1, 0.005 * 5);

const lines = {};
const linePaths = {};
const linePathColors = { 'waveOne': 'blue', 'waveTwo': 'orange', 'resultantWave': 'black' };
const waveNames = ['waveOne', 'waveTwo', 'resultantWave'];
const xAxes = {};
const displacementGroups = {};

waveNames.forEach(waveName => {
	groups[waveName] = svg.append('g');
	displacementGroups[waveName] = groups[waveName].append('g');
	lines[waveName] = d3.line()
		.x(d => { return x(d); }).y(0);
	linePaths[waveName] = groups[waveName].append('path').datum(samples)
		.attr('d', lines[waveName])
		.attr('fill', 'none')
		.attr('stroke', Utils.colors[linePathColors[waveName]])
		.attr('stroke-width', '2');
	xAxes[waveName] = groups[waveName].append('line')
		.attr('stroke', Utils.colors.grey)
		.attr('stroke-width', '2')
		.attr('x1', x(0)).attr('y1', yScales[waveName](0)).attr('x2', x(1)).attr('y2', yScales[waveName](0));
});

const slidersEl = section.select('.sliders');
Utils.createSlider(slidersEl.select('.slider-row.amplitude.one'), val => { waveOne.amplitude = val; });
Utils.createSlider(slidersEl.select('.slider-row.amplitude.two'), val => { waveTwo.amplitude = val; });
Utils.createSlider(slidersEl.select('.slider-row.frequency'), 
	val => { frequency = val / 1000; });
Utils.createSlider(slidersEl.select('.slider-row.phase-difference'), 
	val => { waveTwo.phaseDifference = val * Math.PI; },
	(val, el) => { katex.render(`${val}\\pi`, el.node()); });

Utils.createTimer(svg.node(), elapsed => {
	waveNames.forEach(waveName => {
		if (waveName === 'waveOne')
			lines[waveName].y(d => { return yScales[waveName](wave(d, elapsed, waveOne)); });
		else if (waveName === 'waveTwo')
			lines[waveName].y(d => { return yScales[waveName](wave(d, elapsed, waveTwo)); });
		else 
			lines[waveName].y(d => { return yScales[waveName](wave(d, elapsed, waveOne) + wave(d, elapsed, waveTwo)); });
		linePaths[waveName].attr('d', lines[waveName]);

		if (waveName !== 'resultantWave') {
			let displacementItems = displacementGroups[waveName].selectAll('line').data(displacementSamples);
			const waveProps = waveName === 'waveOne' ? waveOne : waveTwo;
			let displacementItemsEnter = displacementItems.enter()
				.append('line')
					.attr('stroke', Utils.colors[linePathColors[waveName]])
					.attr('stroke-width', 2)
					.attr('stroke-linecap', 'round')
				.merge(displacementItems)
					.attr('x1', d => { return x(d); }).attr('y1', d => { return yScales[waveName](0); })
					.attr('x2', d => { return x(d); }).attr('y2', d => { return yScales[waveName](wave(d, elapsed, waveProps)); });
		} else if (waveName === 'resultantWave') {
			let displacementItems = displacementGroups[waveName].selectAll('g').data(displacementSamples);
			let displacementItemsEnter = displacementItems.enter().append('g');
			displacementItemsEnter
				.append('line')
					.attr('class', 'waveOne')
					.attr('stroke', Utils.colors[linePathColors['waveOne']])
					.attr('stroke-width', 4)
					.attr('stroke-linecap', 'round')
					.attr('x1', d => { return x(d); }).attr('y1', d => { return yScales[waveName](0); });
			displacementItemsEnter
				.append('line')
					.attr('class', 'waveTwo')
					.attr('stroke', Utils.colors[linePathColors['waveTwo']])
					.attr('stroke-width', 1)
					.attr('stroke-linecap', 'round')
					.attr('x1', d => { return x(d); }).attr('x2', d => { return x(d); });
			let displacementItemsMerge = displacementItems.merge(displacementItemsEnter);

			displacementItemsMerge.select('line.waveOne')
				.attr('x2', d => { return x(d); }).attr('y2', d => { return yScales[waveName](wave(d, elapsed, waveOne)); });
			
			displacementItemsMerge.select('line.waveTwo')
				.attr('y1', d => { return yScales[waveName](wave(d, elapsed, waveOne)); })
				.attr('y2', d => { return yScales[waveName](wave(d, elapsed, waveOne) + wave(d, elapsed, waveTwo)); });
		}
	});
});