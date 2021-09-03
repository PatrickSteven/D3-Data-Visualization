
const dataSource = "https://oec.world/olap-proxy/data?cube=trade_i_baci_a_92&Exporter+Country=nacri&drilldowns=HS4&measures=Trade+Value&parents=true&Year=2019&sparse=false&locale=en&q=Trade%20Value"

function loadData(){
    var dataPromise = d3.json(dataSource)
    return dataPromise.then(function(result){
        console.log(result)
        return result
    });
}

export async function treeFromData(){

    const data = await loadData()
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
    
    const sectionList = []
    for(let keySection in tree){
        const HS2List = []
        const section = tree[keySection]
        for(let keyHS2 in section.children){
            const HS4List = []
            const HS2 = section.children[keyHS2]
            for(let keyHS4 in HS2.children){
                const HS4 = HS2.children[keyHS4]
                HS4List.push(HS4)
            }
            HS2.children = HS4List
            HS2List.push(HS2)
        }
        section.children = HS2List
        sectionList.push(section)
    }

    return {"Section": "Productos de exportacion", "children": sectionList}
}

