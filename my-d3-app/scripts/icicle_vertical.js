import {treeFromData} from './data.js'
import {colors} from './colors.js'

const format = d3.format(",d")
const height = 500
const width = 500

const opacity = 0.6

const maxValue = 13022117476.0

export async function icicle(){

    const treeData = await treeFromData()
    const root = createHierarchy(treeData)
    let focus = root

    const svg = d3.select("#icicle")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])

    const cell = svg
    .selectAll("g")
    .data(root.descendants())
    .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);
    
    const rect = cell.append("rect")
    .attr("height", d => d.y1 - d.y0 - 1)
    .attr("width", d => rectHeight(d))
    .attr("fill-opacity", opacity)
    .attr("fill", d => {
        return getColor(d)
    })
    .style("cursor", "pointer")
    .on("click", clicked)
    .on('mouseover', function (d, i) {
          d3.select(this).transition()
               .duration('50')
               .attr('opacity', '.85')
          createInformationalCard(d)
    })
    .on('mouseout', function (d, i) {
          d3.select(this).transition()
               .duration('50')
               .attr('opacity', '1')

          createInformationalCard(focus)
    })

    const textWrapper = cell.append("svg")
    .attr("class", "text-wrapper")
    .attr("height", d => {return (d.y1 - d.y0 - 1)})
    .attr("width", d => {return (rectHeight(d))})

    const textName = textWrapper.append("text")
    .style("user-select", "none")
    .attr("pointer-events", "none")
    .attr("x", 4)
    .attr("y", d => (d.y1 - d.y0)*0.05 + getFontSize(d))
    .attr("fill-opacity", d => +labelVisible(d))
    .text(d => d.data.name)
    .attr("font-size", d => getFontSize(d))
    .attr("font-family", "sans-serif")
    .attr("class","fw-normal")

    const textValue = textWrapper.append("text")
    .style("user-select", "none")
    .attr("pointer-events", "none")
    .attr("x", 4)
    .attr("y", d => (d.y1 - d.y0)*0.1 + getFontSize(d)*2)
    .attr("fill-opacity", d => labelVisible(d) * 0.7)
    .attr("font-size", d => getFontSize(d))
    .attr("font-family", "sans-serif")
    .attr("class","fw-lighter")
    .text(d => {
        d.percentage = d.parent ? (d.value/maxValue*100) : 100
        d.percentage = d.percentage.toFixed(2) 
        return d.percentage.toString() + "%"
    })
    
    cell.append("title")
          .text(d => `${d.data.name}\n${d.percentage + "%"}`);


    createTab(focus)
    createInformationalCard(focus)

    console.log("Tree Data")
    console.log(treeData)

    console.log("icicle")
    console.log(root)

    return svg.node()
      
    function clicked(event, p) {
        focus = focus === event ? (event.parent ? event.parent: event) : event;
        draw()
    }

    function draw(){
        root.each(d => {

            d.target = {
                y0: (d.x0 - focus.x0) / (focus.x1 - focus.x0) * height,
                y1: (d.x1 - focus.x0) / (focus.x1 - focus.x0) * height,
                x0: d.y0 - focus.y0,
                x1: d.y1 - focus.y0
            }
        });
        
        const t = cell.transition().duration(300)
        .attr("transform", d => `translate(${d.target.y0},${d.target.x0})`);

        rect.transition(t)
        .attr("width", d => d.target.y1 - d.target.y0 - 1)
        .attr("height", d => rectHeight(d.target))
        //.attr("display", d => {
            //return labelVisible(d.target) ? "block" : "none"
        //})

        textName.transition(t)
        .attr("fill-opacity", d => +labelVisible(d.target))
        .attr("y", d => (d.target.x1 - d.target.x0)*0.05 + getFontSize(d.target))
        .attr("font-size", d => getFontSize(d.target))

        textValue.transition(t)
        .attr("fill-opacity", d => labelVisible(d.target) * 0.7)
        .attr("y", d => (d.target.x1 - d.target.x0)*0.1 + getFontSize(d.target)*2)
        .attr("font-size", d => getFontSize(d.target))

        textWrapper.transition(t)
        .attr("width", d => {return (d.target.y1 - d.target.y0 - 1) + "px"})
        .attr("height", d => {return (rectHeight(d.target)) + "px"})

        createTab(focus)
        createInformationalCard(focus)
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
        d3.select("#icicle_info").selectAll(".icicle-info-card").remove()
        
        //Create new card
        const cardHeader = d3.select("#icicle_info")
        .append("div")
        .attr("class", "icicle-info-card card-header")
        .style("background-color", getColor(d))
        .style("color", "white")
        .style("opacity", opacity)
        .text("Product")

        const cardBody = d3.select("#icicle_info")
        .append("div")
        .attr("class", "icicle-info-card card-body")

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
            const cardFooter = d3.select("#icicle_info")
            .append("div")
            .attr("class", "icicle-info-card card-footer text-muted")
            .style("background-color", getColor(d))
            .style("opacity", opacity)
       
            cardFooter.append("img")
            .attr("class", "card-icon")
            .attr("src", "https://oec.world/images/icons/hs/hs_" + d.data["Section ID"] + ".svg")
        }

    }


    function createHierarchy(data){
        const root = d3.hierarchy(data)
        .sum(d => d["Trade Value"])
        .sort((a, b) => b.height - a.height || b.value - a.value);  
        
        const icicle = d3.partition().size([height, (root.height + 1) * width / 4])(root);
        return icicle
    }

    function rectHeight(d) {
        return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
    }

    function labelVisible(d) {
        return d.x1 <= height && d.x0 >= 0 && d.y1 - d.y0 > 20;
    }

    function getColor(d){
        
        const sectionID = d.data["Section ID"]
        if(d.data["HS4 ID"]) return colors[sectionID]["HS4"]
        else if(d.data["HS2 ID"]) return colors[sectionID]["HS2"]
        else if(d.data["Section ID"]) return colors[sectionID]["Section"]
        else return "rgba(118, 39,108,1)"
        
    }

    function getFontSize(d){
        const width = d.y1 - d.y0
        if(width <= 35)  
            return width*0.25
        else return 10
    }
}



