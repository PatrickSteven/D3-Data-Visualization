import {treeFromData} from './data.js'
const format = d3.format(",d")
const height = 1200
const width = 975


export async function icicle(){

    const treeData = await treeFromData()
    const root = createHierarchy(treeData)
    let focus = root

    const svg = d3.select("#icicle")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("font", "10px sans-serif");

    const cell = svg
    .selectAll("g")
    .data(root.descendants())
    .join("g")
      .attr("transform", d => `translate(${d.y0},${d.x0})`);
    
      const rect = cell.append("rect")
      .attr("width", d => d.y1 - d.y0 - 1)
      .attr("height", d => rectHeight(d))
      .attr("fill-opacity", 0.6)
      .attr("fill", d => {
        if (!d.depth) return "#ccc";
        while (d.depth > 1) d = d.parent;
        return getColor(d);
      })
      .style("cursor", "pointer")
      .on("click", clicked);

      const text = cell.append("text")
          .style("user-select", "none")
          .attr("pointer-events", "none")
          .attr("x", 4)
          .attr("y", 13)
          .attr("fill-opacity", d => +labelVisible(d))

    const tspanName = text.append("tspan")
        .text(d => d.data.name)

      const tspanValue = text.append("tspan")
          .attr("fill-opacity", d => labelVisible(d) * 0.7)
          .text(d => ` ${format(d.value)}`);

      cell.append("title")
          .text(d => `${
              d.ancestors().map(d => d.data.name).reverse().join("/")}\n
              ${format(d.value)
            }`);

      function clicked(event, p) {
        focus = focus === event ? (event.parent ? event.parent: event) : event;

        root.each(d => d.target = {
          x0: (d.x0 - focus.x0) / (focus.x1 - focus.x0) * height,
          x1: (d.x1 - focus.x0) / (focus.x1 - focus.x0) * height,
          y0: d.y0 - focus.y0,
          y1: d.y1 - focus.y0
        });

        const t = cell.transition().duration(750)
            .attr("transform", d => `translate(${d.target.y0},${d.target.x0})`);

        rect.transition(t).attr("height", d => rectHeight(d.target));
        text.transition(t).attr("fill-opacity", d => +labelVisible(d.target));
        tspanValue.transition(t).attr("fill-opacity", d => labelVisible(d.target) * 0.7);


        createTab(focus)

      }
 
    console.log("Tree Data")
    console.log(treeData)

    console.log("icicle")
    console.log(root)

    return svg.node()
      
}

function createHierarchy(data){
    const root = d3.hierarchy(data)
    .sum(d => d["Trade Value"])
    .sort((a, b) => b.height - a.height || b.value - a.value);  
    
    const icicle = d3.partition().size([height, (root.height + 1) * width / 3])(root);
    return icicle
}

function rectHeight(d) {
    return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
}

function labelVisible(d) {
    return d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 16;
}

function getColor(data){
    d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1))
}

function createTab(currentNode){
    
    //Clear icicle tab
    d3.select("#icicle_tab").selectAll("ul").remove()
    
    //Create new tab
    const genericTab = d3.select("#icicle_tab")
    .append("ul")
    .attr("class", "nav nav-tabs")
    
    insertParentTab(currentNode, genericTab)

    //Recursive function
    function insertParentTab(node, tab){
        if(node.parent)
            tab = insertParentTab(node.parent, tab)

        //insert current node after parent node
        tab.append("li")
        .attr("class", "nav-item")
        .append("a")
        .attr("class", function() { 
            return node.data.name === currentNode.data.name
            ? "nav-link active"
            : "nav-link"
        })
        .text(node.data.name)

        return tab
    }
}

