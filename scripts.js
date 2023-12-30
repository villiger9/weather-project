// Function to fetch weather data from OpenWeatherMap API
async function fetchData() {
  const apiKey = 'bc06d6bc2a42351e5ea6bc88757e8639'; // Replace with your API key
  const city = 'Damascus';
  const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`);
  const data = await response.json();

  // Extract relevant data from the response and convert temperature to Celsius
  const hourlyData = data.list.map(entry => ({
    timestamp_local: new Date(entry.dt * 1000).toLocaleString(), // Convert timestamp to local time
    temp: entry.main.temp - 273.15, // Convert Kelvin to Celsius
  }));

  return hourlyData;
}


// Function to create a line chart using D3.js
async function createChart() {
  const data = await fetchData();

  // Filter out invalid data points
  const validData = data.filter(entry => !isNaN(entry.temp) && !isNaN(new Date(entry.timestamp_local)));

  // Set up SVG container and dimensions
  const margin = { top: 20, right: 30, bottom: 50, left: 50 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Select the chart container
  const container = d3.select('#chart-container');

  // Create an SVG element within the container
  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Extract timestamps and temperatures from the valid data
  const times = validData.map(entry => entry.timestamp_local);
  const temperatures = validData.map(entry => entry.temp);

  // Set up scales for x and y axes
  const x = d3.scaleTime()
    .domain([new Date(times[0]), new Date(times[times.length - 1])])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([d3.min(temperatures) - 1, d3.max(temperatures) + 1])
    .range([height, 0]);

  // Define a line function for the chart with step interpolation
  const line = d3.line()
    .x(d => x(new Date(d.timestamp_local)))
    .y(d => y(d.temp))
    .curve(d3.curveStepBefore); // Use step-before interpolation

  // Draw the step chart with thicker lines
  svg.append('path')
    .data([validData])
    .attr('class', 'line')
    .attr('d', line)
    .style('stroke', '#3498db') // Line color
    .style('fill', 'none') // Disable area fill
    .style('stroke-width', 2); // Increase line thickness

  // Draw data points as circles
  svg.selectAll('.dot')
    .data(validData)
    .enter().append('circle')
    .attr('class', 'dot')
    .attr('cx', d => x(new Date(d.timestamp_local)))
    .attr('cy', d => y(d.temp))
    .attr('r', 5) // Radius of the data points
    .style('fill', '#3498db'); // Data point color

  // Add axes
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(d3.timeHour.every(6)).tickFormat(d3.timeFormat('%m-%d %H:%M')))
    .selectAll('text')
    .attr('transform', 'rotate(-45)') // Rotate x-axis labels for better readability
    .style('text-anchor', 'end');

  svg.append('g')
    .call(d3.axisLeft(y));

  // Add gridlines with slightly darker color
svg.append('g')
.attr('class', 'grid')
.attr('transform', `translate(0,${height})`)
.call(d3.axisBottom(x).ticks(d3.timeHour.every(6)).tickSize(-height).tickFormat(''))
.selectAll('line')
.style('stroke', '#bbb');

svg.append('g')
.attr('class', 'grid')
.call(d3.axisLeft(y).tickSize(-width).tickFormat(''))
.selectAll('line')
.style('stroke', '#bbb');


  // Add labels
  svg.append('text')
    .attr('transform', `translate(${width / 2},${height + margin.top + 20})`)
    .style('text-anchor', 'middle')
    .text('Time');

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - (height / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Temperature (°C)');
}



// Initialize the chart
createChart();

