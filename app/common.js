// Load application styles
import 'styles/common.scss';

renderMathInElement(document.body, { 
	delimiters: [
		{left: '$', right: '$', display: false},
		{left: '\\(', right: '\\)', display: true}
	]
});

import 'defs.js';