window.onload = function () {
    KeyLines.promisify();
    $.getJSON('https://bost.ocks.org/mike/miserables/miserables.json', rawData=>{
    KeyLines.paths({ assets: './assets/' });
    buildData(rawData).then(
        data=>{
            const items = [...data[0],...data[1]];
            KeyLines.create({id:'chartDiv', options:{backColour:'#A19E9E'}}).then(chart=>{
              chart.load({
                type: 'LinkChart',
                items: items
              }).then(resolve=>{
                  chart.each({type:'link'}, link=>{
                      const node = chart.getItem(link.id2);
                      const newDonut = node.donut;
                      newDonut.bw+=link.w;
                      chart.setProperties({
                          id:node.id, 
                          donut:newDonut
                      });
                  });
                  chart.layout('standard', {fit:true, tidy:true, straighten:false});
                  
              }).catch(
                  err=>{console.error(err);
              });
              chart.bind('dblclick',handleClickEvent);
            }, 
            err=>{console.error(err);});
        }, 
        err=>{console.error(err);});
  });
};

function buildData(data){
    return Promise.all([buildNodes(data.nodes), buildLinks(data.links)]);
}

function buildNodes(data){
    return new Promise((resolve,reject)=>{
        try{
            const nodes=[];
            const colours = ['red','green','blue','purple','black','yellow','lime','aqua','teal', 'orange', 'fuchsia'];
            data.forEach(node=>{
                nodes.push({
                            id:'node'+data.indexOf(node), 
                            type: 'node', 
                            t:node.name, 
                            tc:true, 
                            u: 'images/icons/person2.png', 
                            c:colours[node.group%10], 
                            d:{
                                group:node.group
                            }, 
                            fbc: 'white',
                            fb:true,
                            fs:20,
                            tc:false,
                            donut:{
                                v: [ 0 ],
                                b:colours[node.group%10],
                                bw:0
                            }
                });
            });
            resolve(nodes.sort((a,b)=>{
                return a.d.group >= b.d.group;
            }));
        }catch(e){
            throw "buildNodes: "+e.message;
        }
    });
}

function buildLinks(data){
    return new Promise((resolve,reject)=>{
        try{
            const links=[];
            data.forEach(link=>{
                links.push({
                    id:'link'+data.indexOf(link), 
                    type: 'link', 
                    id1:'node'+link.source, 
                    id2:'node'+link.target, 
                    w:link.value/5, 
                    a2:true, 
                    off:30});
            });
            resolve(links);
        }catch(e){
            throw "buildLinks: "+e.message;
        }
    });
}

function handleClickEvent(id,x,y,button,sub){
    event.stopPropagation();
    resetLinkColour();
    const chart = KeyLines.components['chartDiv'];
    if(id && chart.getItem(id).type === 'node'){
        colourLinkSources(id);
        chart.zoom('selection',{ids:id});
    }else if(!id){
        chart.zoom('fit');
    }
    return true;
}

function resetLinkColour(){
    const chart = KeyLines.components['chartDiv'];
    chart.each({type:'link'},link=>{
            chart.setProperties({id:link.id, c:'grey'});
        });
}

function colourLinkSources(id){
    const chart = KeyLines.components['chartDiv'];
    if(id && chart.getItem(id).type === 'node'){
        for(let link of chart.graph().neighbours(id).links){
        	if(chart.getItem(link).id1 == id){
	            chart.setProperties({id:link, c:chart.getItem(chart.getItem(link).id2).c});
	        }else{
	        	chart.setProperties({id:link, c:chart.getItem(chart.getItem(link).id1).c});
	        }
        }
    }
}