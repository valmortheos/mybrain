import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphLink, CognitiveGroup } from '../types';
import { COLORS } from '../constants';
import { triggerHaptic } from '../services/device/haptics';

interface NeuralGraphProps {
  data: { nodes: GraphNode[]; links: GraphLink[] };
}

const NeuralGraph: React.FC<NeuralGraphProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 1. Handle Responsive Resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateDimensions);
    });
    
    resizeObserver.observe(containerRef.current);
    updateDimensions();

    return () => resizeObserver.disconnect();
  }, []);

  // 2. D3 Simulation Logic
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Definitions for gradients/filters
    const defs = svg.append("defs");
    
    // Improved Glow Filter
    const filter = defs.append("filter")
      .attr("id", "neural-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Simulation Setup
    const simulation = d3.forceSimulation<GraphNode>(data.nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(data.links).id(d => d.id).distance(90)) // Increased distance
      .force("charge", d3.forceManyBody().strength(-250)) // Stronger repulsion
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force("collide", d3.forceCollide().radius(d => d.val + 20).iterations(3)) // Better collision
      .force("x", d3.forceX(dimensions.width / 2).strength(0.04))
      .force("y", d3.forceY(dimensions.height / 2).strength(0.04));

    // Links
    const link = svg.append("g")
      .selectAll("line")
      .data(data.links)
      .enter().append("line")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.3)
      .attr("stroke-width", d => Math.max(1, Math.sqrt(d.value)));

    // Nodes
    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(data.nodes)
      .enter().append("g")
      .attr("cursor", "grab")
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Node Circles
    nodeGroup.append("circle")
      .attr("r", d => d.val)
      .attr("fill", d => COLORS[d.group])
      .attr("stroke", d => d.group === CognitiveGroup.CORE ? "#e2e8f0" : "#fff")
      .attr("stroke-width", d => d.group === CognitiveGroup.CORE ? 3 : 2)
      .style("filter", d => d.group === CognitiveGroup.CORE ? "url(#neural-glow)" : "none")
      .attr("class", "transition-all duration-300 hover:opacity-90")
      .on("click", (event, d) => {
        event.stopPropagation();
        triggerHaptic('medium'); // Vibrate when clicked/impulsed
        setSelectedNode(d);
      });

    // Core Pulse Animation
    if (data.nodes.length > 0) {
        d3.select(nodeGroup.nodes()[0]).select("circle")
          .append("animate")
          .attr("attributeName", "r")
          .attr("values", `${data.nodes[0].val};${data.nodes[0].val + 4};${data.nodes[0].val}`)
          .attr("dur", "4s")
          .attr("repeatCount", "indefinite");
    }

    // Labels
    nodeGroup.append("text")
      .text(d => d.label)
      .attr("x", 0)
      .attr("y", d => d.val + 14)
      .attr("text-anchor", "middle")
      .style("font-size", "9px")
      .style("font-family", "ui-sans-serif, system-ui")
      .style("font-weight", "600")
      .style("fill", "#64748b")
      .style("pointer-events", "none")
      .style("text-transform", "uppercase")
      .style("letter-spacing", "0.05em")
      .style("text-shadow", "0 1px 2px rgba(255,255,255,0.8)");

    // Tick
    simulation.on("tick", () => {
      // Gentle bounds constraint
      nodeGroup.attr("transform", d => {
        d.x = Math.max(d.val, Math.min(dimensions.width - d.val, d.x!));
        d.y = Math.max(d.val, Math.min(dimensions.height - d.val, d.y!));
        return `translate(${d.x},${d.y})`;
      });

      link
        .attr("x1", d => (d.source as GraphNode).x!)
        .attr("y1", d => (d.source as GraphNode).y!)
        .attr("x2", d => (d.target as GraphNode).x!)
        .attr("y2", d => (d.target as GraphNode).y!);
    });

    // D3 Drag Handlers
    function dragstarted(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      d3.select(event.sourceEvent.target).attr("cursor", "grabbing");
    }

    function dragged(event: any, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      d3.select(event.sourceEvent.target).attr("cursor", "grab");
    }

    return () => simulation.stop();

  }, [data, dimensions]);

  return (
    <div 
        ref={containerRef} 
        className="relative w-full h-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus:outline-none" 
        onClick={() => setSelectedNode(null)}
        tabIndex={-1} 
    >
      <svg ref={svgRef} className="w-full h-full block touch-none" />
      
      {/* Empty State */}
      {data.nodes.length <= 1 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center opacity-30 select-none">
          <p className="text-5xl font-thin tracking-widest text-slate-300">VOID</p>
        </div>
      )}

      {/* Node Details Card - Floating */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-slate-100 animate-in slide-in-from-bottom-5 duration-300 z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: COLORS[selectedNode.group] }}></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedNode.group}</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setSelectedNode(null); }} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
            </button>
          </div>
          <h3 className="text-xl font-bold text-slate-800 leading-tight mb-2">{selectedNode.label}</h3>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
             <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {selectedNode.description || "Simpul kognitif ini belum terpetakan sepenuhnya."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeuralGraph;