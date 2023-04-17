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
function findMutations(seq1, seq2) {
  const mutations = [];
  for (var i = 1; i < seq1.length; i++) {
    if (seq1[i] !== seq2[i]) {
      mutations.push(`${seq2[i]}`);
    }
  } 
  return mutations;
}
const mutations=[]
for(let i = 0; i < dataArray.length-1; i++){
  const mutation=[];
  for(let j = 0; j < dataArray.length-1; j++){ 
  mutation.push(findMutations(dataArray[i]['amino_seq'], dataArray[j]['amino_seq']));
}
 mutations[i+1]=mutation;
}
edges_nodes=[]
const mutation1 = {}; 
seq_index=['A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L',
'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'Y']
for (let i = 0; i < dataArray.length; i++) {
  const mutation2 = dataArray[i]['mutation'];
  const diff = [];
  for (let key in mutation2) {
    if (mutation1[key] !== mutation2[key]) {
        diff.push(seq_index[mutation2[key]]);
    }
  } 
  edges_nodes[i]=diff;
}
mutations[0]=edges_nodes
//source dropdown
const sourceNode = document.getElementById('sourceNode');
const nodes_length=dataArray.length
    for (let i = 0; i < nodes_length; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.text = `Node ${i}`;
      sourceNode.appendChild(option);
    }
    let selectedNodeId = 0;
//target dropdown
const targetNode = document.getElementById("targetNode");
for (let i = 0; i < nodes_length; i++) {
  const option = document.createElement('option');
  option.value = i;
  option.text = `Node ${i}`;
  targetNode.appendChild(option);
}
sourceNode.addEventListener('change', (event) => {
      let myChart = echarts.init(document.getElementById('chart-container'));
      myChart.clear();
      
      selectedNodeId = event.target.value;
      //calculating mutations
      edges_nodes=mutations[selectedNodeId];  
//loading data into nodes and edges
  const data = [];
  const edges = [];

  for (let i = 0; i < dataArray.length; i++) {
    let isFixed = false;
    let x_value = Math.random() * (myChart.getWidth()-50);
      let y_value = Math.random() * (myChart.getHeight()-50 );
    let nodeColor = '#034f84'; 
    let size=25;
    if (i === parseInt(selectedNodeId)) {
      console.log("Hi"); 
        isFixed = true;
        size= 30,
        x_value = myChart.getWidth() / 2;
        y_value = myChart.getHeight() / 2;
        console.log(x_value);
        console.log(y_value);
        nodeColor = '#c94c4c'; 
    }
    data.push({
        id: i,
        mutation: `${edges_nodes[i-1]}`,
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
for (let i = 0; i < edges_nodes.length; i++) {

  if( i+1!==selectedNodeId){ 
    edges.push({ 
      source: selectedNodeId,
      target: i+1,
      label: {
        show: false,
        fontSize: 20,
        formatter: `${edges_nodes[i]}`,
        color: '#c83349' 
      },
      itemStyle: {
        color: '#82b74b' 
      },
      emphasis: {
        label: {
          show: true
        }
      } 
    });
  }
}
//display tooltip when user hover on nodes
  myChart.setOption({
    title: {
      top: 'bottom',
      left: 'right'
    },
    tooltip: {
      enterable: true,
      // hideDelay: 50000000,
      hideOnClick: false,
      show: true,
      formatter: function(params) {

        let num_selectedNodeId=parseInt(selectedNodeId);
        if((params.dataType === 'node' && params.data.id===num_selectedNodeId )){
          return 'Node : '+ selectedNodeId;
       }
       var id=params.data.id-1;
        if (params.dataType === 'node' && edges_nodes[id]!=0){
          
         var data = params.data;
        return  'Source Node : ' +selectedNodeId+'<br>'+ 'Target Node : ' + data.id + '<br>' +'Mutation : '+ data.mutation;
      }
      if (params.dataType === 'node'){
        var data = params.data;
       return  'Source Node : ' +selectedNodeId+'<br>'+ 'Target Node : ' + data.id + '<br>' +'Zero Mutation';
      }
    }
    },
    series: [
      {
        roam: false,
        type: 'graph',
        animation:false,
        layout:'force',
        draggable: true,
        data: data,
        force: {
                  repulsion: 100,
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
  //display and higlight the source and target nodes when user selects the target node from dropdown
  let keepTooltipVisible = false;
  targetNode.addEventListener('change', (event) => {
    
    targetselectedNodeId = event.target.value;
    myChart.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: targetselectedNodeId
    });
    keepTooltipVisible = true;
    setTimeout(() => {
      myChart.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        dataIndex: targetselectedNodeId
      });
    }, 50);

  });
 
    });
    
    myChart.getZr().on('click', function() {
      if (!keepTooltipVisible) {
        myChart.dispatchAction({
          type: 'hideTip'
        });
      }
      keepTooltipVisible = false;
    });
window.addEventListener('resize', myChart.resize);
  };

  reader.readAsText(file);
});
