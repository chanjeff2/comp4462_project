import { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topoJson from 'topojson-client';
import { Topology } from 'topojson-specification';

interface GlobeProps { }

export const Globe = (props: GlobeProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const width = 800;
  const height = 600;
  const sensitivity = 75;

  useEffect(() => {
    // the main svg
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // projection - orthographic
    const projection = d3.geoOrthographic()
      .scale(250)
      .rotate([0, 0])
      .center([0, 0])
      .translate([width / 2, height / 2]);

    const initialScale = projection.scale();
    let path = d3.geoPath(projection);

    // globe outline
    const globe = svg.append("circle")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", "0.2")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", initialScale)


    // graticule lines
    const graticule = d3.geoGraticule()
      .step([10, 10]);

    svg.append("path")
      .datum(graticule)
      .attr("class", "graticule")
      .attr("d", path)
      .style("fill", "none")
      .style("stroke", "#ccc")
      .attr('stroke-width', '0.5px');

    // drag rotate
    const drag: any = d3.drag().on('drag', (event, d) => {
      const rotate = projection.rotate();
      const k = sensitivity / projection.scale();
      projection.rotate([
        rotate[0] + event.dx * k,
        rotate[1] - event.dy * k
      ]);
      path = d3.geoPath().projection(projection)
      svg.selectAll("path").attr("d", path as any)
    })

    svg.call(drag);

    // draw countries
    (async () => {
      const json = await d3.json("/countries-110m.json") as Topology;
      const { countries, land } = json.objects;
      const feature = topoJson.feature(json, countries) as GeoJSON.FeatureCollection;
      svg.append('g')
        .attr("class", "countries")
        .selectAll('path')
        .data(feature.features)
        .enter().append('path')
        .attr("class", "country")
        .attr("d", path)
        .style('fill', (d, i) => '#e7e7e7')
        .style('stroke', '#121212')
        .style('stroke-width', 0.3)
        .style("opacity", 0.8);
    })();

  }, [props]) // redraw chart if data changes

  return (<svg ref={svgRef} />)
}