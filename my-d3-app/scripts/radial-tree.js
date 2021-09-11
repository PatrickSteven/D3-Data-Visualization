import {treeFromData} from './data.js'
import {colors} from './colors.js'


const format = d3.format(",d")
const height = 550
const width = 550

const opacity = 0.6
const maxValue = 13022117476.0

export async function radialTree(){
    const treeData = await treeFromData()
    const root = createHierarchy(treeData)
    root.each(d => {
        d.percentage = d.parent ? (d.value/maxValue*100).toFixed(2) : 100
    })
    let focus = root

    var depthScale = d3.scaleOrdinal()
    .range(["#5EAFC6", "#FE9922", "#93c464", "#75739F"])

    const svg = d3.select("#radial-tree")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])

    var arc = d3.arc()
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1)

    const cell = svg
    .selectAll("g")
    .data(root.descendants())
    .join("g")
    .attr("transform", "translate(255,255)")
    
    const slice = cell
    .append("path")
    .attr("d", ({ y0, y1, x0, x1 }) => arc({y0, y1,
    startAngle: x0, endAngle: x1}))
    //.style("fill", d => depthScale(d.depth))
    .style("fill", d => getColor(d))
    .style("stroke", "black")
    .style("stroke-width", "0.5")
    .on("click", clicked)
    .on('mouseover', function (d, i) {
        d3.select(this).transition()
        .duration('50')
        .attr('opacity', '0.85')
        .style("fill","black")
        
        createInformationalCard(d)
        createTab(d)

    })
    .on('mouseout', function (d, i) {
        d3.select(this).transition()
        .duration('50')
        .style("fill", d => getColor(d))
        .attr('opacity', '1')

        createInformationalCard(focus)
        createTab(focus)
    })

    createInformationalCard(focus)
    createTab(focus)

    function clicked(event, p) {
        focus = focus === event ? (event.parent ? event.parent: event) : event;

        createInformationalCard(focus) 
        createTab(focus)
    }

}

function createHierarchy(data){
    const root = d3.hierarchy(data)
    .sum(d => d["Trade Value"])
    .sort((a, b) => b.height - a.height || b.value - a.value);  
    return d3.partition().size([2 * Math.PI,250])(root);
}

function rectHeight(d) {
    return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
}

function labelVisible(d) {
    return d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 20;
}


function getFontSize(d){
    const height = d.x1 - d.x0
    if(height <= 35)  
        return height*0.25
    else return 10
}

function getColor(d){
    
    const sectionID = d.data["Section ID"]
    if(d.data["HS4 ID"]) return colors[sectionID]["HS4"]
    else if(d.data["HS2 ID"]) return colors[sectionID]["HS2"]
    else if(d.data["Section ID"]) return colors[sectionID]["Section"]
    else return "rgba(118, 39,108,1)"
    
}


function createInformationalCard(d){

    /*  
    <div class="card-header">
        Featured
    </div>
    <div class="card-body">
        <h5 class="card-title">Special title treatment</h5>
        <p class="card-text">With supporting text below as a natural lead-in to additional content.</p>
        <a href="#" class="btn btn-primary">Go somewhere</a>
    </div>
    <div class="card-footer text-muted">
        2 days ago
    </div>
    */

    //Clear icicle info card
    d3.select("#radial-tree-info").selectAll(".radial-tree-info-card").remove()
    
    //Create new card
    const cardHeader = d3.select("#radial-tree-info")
    .append("div")
    .attr("class", "radial-tree-info-card card-header")
    .style("background-color", getColor(d))
    .style("color", "white")
    .style("opacity", opacity)
    .text("Product")

    const cardBody = d3.select("#radial-tree-info")
    .append("div")
    .attr("class", "radial-tree-info-card card-body")

    cardBody.append("h5")
    .attr("class", "card-title")
    .text(d.data.name)

    cardBody.append("p")
    .attr("class", "card-text")
    .text("Percentage: " + d.percentage + "%")

    cardBody.append("p")
    .attr("class", "card-text")
    .text("Trade Value: $" + d.value)

    if(d.data["Section ID"]){
        const cardFooter = d3.select("#radial-tree-info")
        .append("div")
        .attr("class", "radial-tree-info-card card-footer text-muted")
        .style("background-color", getColor(d))
        .style("opacity", opacity)
   
        cardFooter.append("img")
        .attr("class", "card-icon")
        .attr("src", "https://oec.world/images/icons/hs/hs_" + d.data["Section ID"] + ".svg")
    }

}


function createTab(currentNode){
    
    //Clear icicle tab
    d3.select("#radial-tree-tab").selectAll("ul").remove()
    
    //Create new tab
    const genericTab = d3.select("#radial-tree-tab")
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
