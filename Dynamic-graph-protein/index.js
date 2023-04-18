var dom = document.getElementById('chart-container');
var myChart = echarts.init(dom, null, {
  renderer: 'canvas',
  useDirtyRect: false
});
var app = {};
var option;
//loading the data
var dataArray = [];
const uploadconfirm = document.getElementById('uploadconfirm');
uploadconfirm.addEventListener('click', () => {
  const file = document.getElementById('uploadfile').files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    const csvData = event.target.result;
    const results = Papa.parse(csvData, { header: true }).data;

    let counter = 0;
    dataArray = results.map(row => {
      counter++;
      const diffStr = row.diff || '';
      let mutationObj;
      try {
        const formattedStr = diffStr.replace(/(\w+)\s*:/g, '"$1":');
        mutationObj = JSON.parse(formattedStr);
      } catch (e) {
        mutationObj = {};
      }
      return {
        node_id: counter,
        mutation: mutationObj,
        amino_seq: row.amino_seq
      };
    });
//calculating mutations
seq_index=['A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L',
'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'Y']
//new edges
new_edges={};
for(let i=0;i<dataArray.length-1;i++){ 
    const muta = dataArray[i]['mutation'];
    const diff={};
    for(let key in muta){
       diff[key]=seq_index[muta[key]];
    }
    new_edges[i+1]=diff;
}
console.log(new_edges[2]);
//source dropdown
const sourceNode = document.getElementById('sourceNode');
const nodes_length=dataArray.length
    for(let i = 0; i < dataArray.length-1; i++) {
      const option = document.createElement('option');
      option.value = i+1;
      option.text = `Node ${i+1}`;
      sourceNode.appendChild(option);
    }
    let selectedNodeId = 0;
sourceNode.addEventListener('change', (event) => {
  let myChart = echarts.init(document.getElementById('chart-container'));
  myChart.clear();
  selectedNodeId = event.target.value;
//All nodes
if(parseInt(selectedNodeId)===-1){
  const data = [];
  const edges = [];

  for (let i = 1; i < dataArray.length; i++) {
    let isFixed = false;
    let x_value = Math.random() * (myChart.getWidth()-50);
      let y_value = Math.random() * (myChart.getHeight()-50 );
    let nodeColor = '#034f84'; 
    let size=25;
    let mut=new_edges[i];
    data.push({
        id: i,
        mutation: `${mut}`,
        x: x_value,
        y: y_value,
        symbolSize: size,
        fixed: isFixed,
        label: {
            show: true,
            formatter: `${i}`,
            position: 'inside'
        },
        itemStyle: {
            color: nodeColor 
        }
    });
}
//edges
for (let i = 1; i < dataArray.length; i++) {
 for(let key in new_edges[i]){
    edges.push({ 
      source: i-1,
      target: key,
      label: {
        show: false,
        fontSize: 20,
        formatter: `${new_edges[i][key]}`,
        color: '#c83349' 
      },
      itemStyle: {
        color: '#82b74b' 
      },
      lineStyle: {
        width: 3,
        type: 'solid'
      },
      emphasis: {
        label: {
          show: true
        }
      } 

    });
  }
}
  myChart.setOption({
    title: {
      top: 'bottom',
      left: 'right'
    },
    tooltip: {
      enterable: true,
      hideOnClick: false,
      show: true,
      formatter: function(params) {
        if (params.dataType === 'node' ){
          
         var data = params.data;
           muta=[]
         for(let key in new_edges[data.id]){
              muta.push(" "+key+ " : "+new_edges[data.id][key]+" ");
         }
         if(muta.length===0)
         return   'Node : ' + data.id + '<br>' +'No Mutation';  
        return   'Node : ' + data.id + '<br>' +'Mutation : '+ muta;
      }
      
    }
    },
    series: [
      {
        roam: false,
        type: 'graph',
        animation:false,
        layout:'force',
        data: data,
        force: {
                  repulsion: 200,
                  edgeLength: 300
         },
        edges: edges,
        emphasis: {
          focus: 'adjacency',
          itemStyle: {
            color: '#c94c4c', 
            borderWidth: 3 
          },
          lineStyle: {
            color: '#f00',
            width: 3 
          },
          label: {
            show: true,
           }
          
        } 
      }
    ]
  });
}
//particular node
if(parseInt(selectedNodeId)!==-1){ 
const edges = [];
const keys=[]
const data = [
  {
    fixed: true,
    x: myChart.getWidth() / 2,
    y: myChart.getHeight() / 2,
    symbolSize: 30,
    id: selectedNodeId,
    mutation: `${new_edges[selectedNodeId]}`,
    label: {
          show: true,
          formatter: `${selectedNodeId}`,
          position: 'inside'
      },
      itemStyle: {
          color: '#c94c4c' 
      }
  }
];
keys.push(selectedNodeId);
for(key in new_edges[selectedNodeId]){
  
     keys.push(key);
}
for (let i = 0; i < keys.length; i++) {
  let isFixed = false;
  let nodeColor = '#034f84'; 
  let size=25;
  let mut=new_edges[keys[i]];
  if(selectedNodeId!==keys[i]){
  data.push({
      id: keys[i],
      mutation: `${mut}`,
      symbolSize: size,
      fixed: isFixed,
      label: {
          show: true,
          formatter: `${keys[i]}`,
          position: 'inside'
      },
      itemStyle: {
          color: nodeColor 
      }
  });
}
  if(selectedNodeId!==keys[i]){
    edges.push({ 
      source: selectedNodeId,
      target: keys[i],
      label: {
        show: true,
        fontSize: 20,
        formatter: `${new_edges[selectedNodeId][keys[i]]}`,
        color: '#c83349' 
      },
      itemStyle: {
        color: '#82b74b' 
      },
      lineStyle: {
        width: 3,
        type: 'solid'
      },
      emphasis: {
        label: {
          show: true
        }
      } 
    });
  }
  myChart.setOption({
    title: {
      top: 'bottom',
      left: 'right'
    },
    tooltip: {
      show: true,
      formatter: function(params) { 
        if (params.dataType === 'node' ){ 
         var data = params.data;
           muta=[]
         for(let key in new_edges[data.id]){
              muta.push(new_edges[data.id][key]);
         }
         console.log(data.x);
         if(muta.length===0)
           return   'Node : ' + data.id + '<br>' +'No Mutation';  
         if(parseInt(data.id)===parseInt(selectedNodeId))
           return   'Node : ' + data.id + '<br>' +'Mutation : '+ muta;
           return   'Node : ' + data.id ;
      }
      
    }
    },
    series: [
      {
        roam:false,
        animation:false,
        type: 'graph',
        layout:'force',
        draggable: true,
        data: data,
        force: {
                  repulsion: 2000,
                  edgeLength: 200
         },
        edges: edges,
        emphasis: {
          focus: 'adjacency',
          itemStyle: {
            color: '#c94c4c', 
            borderWidth: 3 
          },
          lineStyle: {
            color: '#f00',
            width: 3 
          }
          
        } 
      }
    ]
  });
}
}
});
  window.addEventListener('resize', myChart.resize);
};
reader.readAsText(file);
});
