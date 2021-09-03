function lineas(){
    dataSource = "https://oec.world/olap-proxy/data?cube=trade_i_baci_a_92&Exporter+Country=nacri&drilldowns=HS4&measures=Trade+Value&parents=true&Year=2019&sparse=false&locale=en&q=Trade%20Value"

    d3.json(dataSource, function(d){
         return d
    }).then(function(d){
            //Una vez los datos fueron obtenidos, ya podemos trabajar con ellos.
            const tree = treeFromData(d)
            console.log(tree)
            //draw(d);
        });


    function treeFromData(data){
        
        const tree = []

        data.data.map(d => {
            const dSectionID = d["Section ID"]
            const dSection = d["Section"]
            const dHS2ID = d["HS2 ID"]
            const dHS2 = d["HS2"]
            const dHS4ID = d["HS4 ID"]
            const dHS4 = d["HS4"]
            const dTradeValue = d["Trade Value"]

            if(!tree[dSectionID]){
                //sectionID doesn't exist
                tree[dSectionID] = {
                    "Section ID": dSectionID,
                    "Section": dSection,
                    "children": {}
                }
            }

            if(!tree[dSectionID].children[dHS2ID]){
                //HS2 ID doesn't exist
                tree[dSectionID].children[dHS2ID] = {
                    "HS2 ID": dHS2ID,
                    "HS2": dHS2,
                    "children": {}
                }
            }

            if(!tree[dSectionID].children[dHS2ID].children[dHS4ID]){
                tree[dSectionID].children[dHS2ID].children[dHS4ID] = {
                    "HS4 ID": dHS4ID,
                    "HS4": dHS4,
                    "Trade Value": dTradeValue
                }
            }
        })   
        
        sectionList = []
        for(keySection in tree){
            HS2List = []
            section = tree[keySection]
            for(keyHS2 in section.children){
                HS4List = []
                HS2 = section.children[keyHS2]
                for(keyHS4 in HS2.children){
                    HS4 = HS2.children[keyHS4]
                    HS4List.push(HS4)
                }
                HS2.children = HS4List
                HS2List.push(HS2)
            }
            section.children = HS2List
            sectionList.push(section)
        }

        return {"name": "Sections", "children": sectionList}
    }

    function createHierarchy(data){
        const root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value);  
        
        const icicle = d3.partition().size([height, (root.height + 1) * width / 3])(root);
        return icicle
    }

    //function draw(datos) {
        //console.log(datos.data);
        ////console.log(datos.data.at(0).Section);
        //const root = partition(data);
        //let focus = root;

        //const svg = d3.create("svg")
        //.attr("viewBox", [0, 0, width, height])
        //.style("font", "10px sans-serif");

      //const cell = svg
        //.selectAll("g")
        //.data(root.descendants())
        //.join("g")
          //.attr("transform", d => `translate(${d.y0},${d.x0})`);

      //const rect = cell.append("rect")
          //.attr("width", d => d.y1 - d.y0 - 1)
          //.attr("height", d => rectHeight(d))
          //.attr("fill-opacity", 0.6)
          //.attr("fill", d => {
            //if (!d.depth) return "#ccc";
            //while (d.depth > 1) d = d.parent;
            //return color(d.data.name);
          //})
          //.style("cursor", "pointer")
          //.on("click", clicked);

      //const text = cell.append("text")
          //.style("user-select", "none")
          //.attr("pointer-events", "none")
          //.attr("x", 4)
          //.attr("y", 13)
          //.attr("fill-opacity", d => +labelVisible(d));

      //text.append("tspan")
          //.text(d => d.data.name);

      //const tspan = text.append("tspan")
          //.attr("fill-opacity", d => labelVisible(d) * 0.7)
          //.text(d => ` ${format(d.value)}`);

      //cell.append("title")
          //.text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

      //function clicked(event, p) {
            //focus = focus === p ? p = p.parent : p;

            //root.each(d => d.target = {
              //x0: (d.x0 - p.x0) / (p.x1 - p.x0) * height,
              //x1: (d.x1 - p.x0) / (p.x1 - p.x0) * height,
              //y0: d.y0 - p.y0,
              //y1: d.y1 - p.y0
            //});

            //const t = cell.transition().duration(750)
                //.attr("transform", d => `translate(${d.target.y0},${d.target.x0})`);

            //rect.transition(t).attr("height", d => rectHeight(d.target));
            //text.transition(t).attr("fill-opacity", d => +labelVisible(d.target));
            //tspan.transition(t).attr("fill-opacity", d => labelVisible(d.target) * 0.7);
      //}
      
      //function rectHeight(d) {
        //return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
      //}

      //function labelVisible(d) {
        //return d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 16;
      //}
      
      //return svg.node();
    //}

    //color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1))
    //format = d3.format(",d")
    //height = 1200
    //width = 975
}
