'use client';
import { BaseChart } from "@/components/BaseChart";
import { gold_price } from "@prisma/client";
import * as d3 from "d3";
import React, { useEffect, useLayoutEffect } from "react";

export function LineChart({ data }: { data: gold_price[] }) {

    return (
        <div>
            <h2>Line Chart</h2>
            <BaseChart style={{height: '50vw', background: 'transparent' }}
                renderChart={(container) => {

                    // Clear previous chart
                    d3.select(container).selectAll("*").remove();

                    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
                    const width = container.clientWidth - margin.left - margin.right;
                    const height = container.clientHeight - margin.top - margin.bottom;

                    const svg = d3.select(container)
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);

                    // Parse the date / time
                    const parseTime = t => new Date(parseFloat(t));

                    // Format the data
                    const formattedData = data.map(d => ({
                        ...d,
                        price_time: parseTime(d.price_time),
                        price: d.price,
                    })).filter(d => d.price_time != null).sort((a, b) => a.price_time.getTime() - b.price_time.getTime());

                    // Set the ranges
                    const x = d3.scaleTime()
                        .domain(d3.extent(formattedData, d => d.price_time))
                        .range([0, width]);

                    const y = d3.scaleLinear()
                        .domain([0, d3.max(formattedData, d => parseFloat(d.price))])
                        .nice()
                        .range([height, 0]);

                    // Define the line
                    const line = d3.line<gold_price>()
                        .x(d => {
                            const v = x(parseTime(d.price_time));
                            return v;
                        })
                        .y(d => {
                            const v = y(parseFloat(d.price));
                            return v;
                        });

                    const timeFormat = d3.timeFormat("%Y-%m-%d");

                    // Add the X Axis
                    svg.append("g")
                        .attr("transform", `translate(0,${height})`)
                        .call(d3.axisBottom(x).tickFormat((v, i) => {
                            return timeFormat(v as Date);
                        }));

                    // Add the Y Axis
                    svg.append("g")
                        .call(d3.axisLeft(y));
                    // Add the line path
                    svg.append("path")
                        .datum(formattedData)
                        .attr("fill", "none")
                        .attr("stroke", "steelblue")
                        .attr("stroke-width", 1.5)
                        .attr("d", line(data));
                }}
            />
            <BaseChart style={{height: '50vw', background: 'transparent' }}
                renderChart={(container) => {
                    const list = data?.filter(d => d.price_time_type === 'last')
                    ?.sort((a, b) => (parseFloat(a.price_time) - parseFloat(b.price_time)));
                    console.log('list', list);
                    // Clear previous chart
                    d3.select(container).selectAll("*").remove();

                    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
                    const width = container.clientWidth - margin.left - margin.right;
                    const height = container.clientHeight - margin.top - margin.bottom;

                    const svg = d3.select(container)
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);

                    // Parse the date / time
                    const parseTime = t => new Date(parseFloat(t));

                    // Format the data
                    const formattedData = list.map(d => ({
                        ...d,
                        price_time: parseTime(d.price_time),
                        price: d.price,
                    })).filter(d => d.price_time != null).sort((a, b) => a.price_time.getTime() - b.price_time.getTime());

                    // Set the ranges
                    const x = d3.scaleTime()
                        .domain(d3.extent(formattedData, d => d.price_time))
                        .range([0, width]);

                    const y = d3.scaleLinear()
                        .domain([d3.min(formattedData, d => parseFloat(d.price)), d3.max(formattedData, d => parseFloat(d.price))])
                        .nice()
                        .range([height, 0]);

                    // Define the line
                    const line = d3.line<gold_price>()
                        .x(d => {
                            const v = x(parseTime(d.price_time));
                            return v;
                        })
                        .y(d => {
                            const v = y(parseFloat(d.price));
                            return v;
                        });

                    const timeFormat = d3.timeFormat("%H:%M");

                    // Add the X Axis
                    svg.append("g")
                        .attr("transform", `translate(0,${height})`)
                        .call(d3.axisBottom(x).tickFormat((v, i) => {
                            return timeFormat(v as Date);
                        }));

                    // Add the Y Axis
                    svg.append("g")
                        .call(d3.axisLeft(y));
                    // Add the line path
                    svg.append("path")
                        .datum(formattedData)
                        .attr("fill", "none")
                        .attr("stroke", "steelblue")
                        .attr("stroke-width", 1.5)
                        .attr("d", line(list));
                    const pw = width / formattedData.length;
                    svg.selectAll('.rect')
                        .data(formattedData)
                        .enter()
                        .append('rect')
                        .attr('class', 'rect')
                        .style('cursor', 'pointer')
                        .attr('x', (d, i) => {
                            return x(d.price_time) - pw / 2;
                        })
                        .attr('y', d => 0)
                        .attr('width', pw)
                        .attr('height', height)
                        .attr('fill', 'rgba(255, 160, 122, 0.2)')
                        .on('mouseenter', (event, d) => {
                            const left = x(d.price_time);
                            const top = y(parseFloat(d.price));
                            const toolTipWidth = 138;
                            const toolTipHeight = 48;
                            const toolTipLeft = left + toolTipWidth / 2 > width ? (width - toolTipWidth) : left - (toolTipWidth / 2);
                            const tooltipTop = top - toolTipHeight;
                            const tooltip = svg.append('g')
                                .attr('class', 'tooltip')
                                .attr('transform', `translate(${toolTipLeft},${tooltipTop})`);

                            tooltip.append('rect')
                                .attr('x', 0)
                                .attr('y', 0)
                                .attr('width', toolTipWidth)
                                .attr('height', toolTipHeight - 4)
                                .attr('fill', 'white')
                                .attr('stroke', 'black');

                            tooltip.append('text')
                                .attr('x', 4)
                                .attr('y', 20)
                                .attr('line-height', '20px')
                                .text(`Price: ${d.price}\n`);

                            tooltip.append('text')
                                .attr('x', 4)
                                .attr('y', 40)
                                .attr('line-height', '20px')
                                .text(`${d3.timeFormat('%m月%d日%H:%M:%S')(d.price_time)}`);
                            svg.append('line')
                                .attr('class', 'tooltip')
                                .attr('x1', left)
                                .attr('y1', 0)
                                .attr('x2', left)
                                .attr('y2', height)
                                .attr('stroke', 'red')
                                .attr('stroke-width', 1);
                            svg.append('line')
                                .attr('class', 'tooltip')
                                .attr('x1', 0)
                                .attr('y1', top)
                                .attr('x2', width)
                                .attr('y2', top)
                                .attr('stroke', 'red')
                                .attr('stroke-width', 1);

                        })
                        .on('mouseleave', () => {
                            svg.selectAll('.tooltip').remove();
                        });
                    
                }}
            />
        </div>
    );
}