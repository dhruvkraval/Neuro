function _1(md) {
  return md`
# Force-Directed Tree

    A [force-directed layout](/@d3/force-directed-graph) of a tree using [*hierarchy*.links](https://github.com/d3/d3-hierarchy/blob/master/README.md#node_links).
  `;
}

// Define the main chart function
function _chart(d3, data, width, height, drag, invalidation) {
  // Create a hierarchical representation of the input data
  const root = d3.hierarchy(data);
  // Compute the links between the nodes in the hierarchy
  const links = root.links();
  // Compute an array of descendant nodes of the root
  const nodes = root.descendants();

  // Create a force simulation for the nodes
  const simulation = d3
    .forceSimulation(nodes)
    // Add a force to pull the nodes towards their target links
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(50)
        .strength(1)
    )
    // Add a force to make the nodes repel each other
    .force("charge", d3.forceManyBody().strength(-400))
    // Add a force to align the nodes along the x-axis
    .force("x", d3.forceX().strength(0)) // set y force strength to 0
    // Add a callback function to update the node and link positions on each simulation tick
    .on("tick", () => {
      // Set the x position of each node to the center of the screen
      nodes.forEach((d) => {
        d.x = width / 2;
      });
      // Update the position of the node and link elements in the SVG
      nodeElements.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      linkElements
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
    });

  // Create an SVG element to hold the chart
  const svg = d3
    .create("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height]);

  // Create a group element to hold the links between the nodes
  const link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", 3) // increase the stroke width of the links
    .selectAll("line")
    .data(links)
    .join("line");

  // Create a new group element within the SVG and set its fill and stroke attributes
  const node = svg
    .append("g")
    .attr("fill", "#ffc9f4")
    .attr("stroke", "#000")
    .attr("stroke-width", 1.5)
    // Bind the node data to a selection of circles and join the data to the selection
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    // Set the fill and stroke attributes of the circles based on the data
    .attr("fill", (d) => (d.children ? null : "#000"))
    .attr("stroke", (d) => (d.children ? null : "#fff"))
    .attr("r", 12) // Set the radius of the circles
    .call(drag(simulation)) // Add drag behavior to the circles
    .on("click", (event, d) => {
      // When a circle is clicked, open a new window with a YouTube search for the circle's name
      window.open(
        `https://www.youtube.com/results?search_query=${d.data.name}`,
        "_blank"
      );
    })
    .on("mouseover", function () {
      // When a circle is moused over, apply a glow filter to it
      d3.select(this).style("filter", "url(#glow)");
    })
    .on("mouseout", function () {
      // When the mouse moves off a circle, remove the glow filter
      d3.select(this).style("filter", null);
    });

  const defs = svg.append("defs");

  const filter = defs.append("filter").attr("id", "glow");

  filter
    .append("feGaussianBlur")
    .attr("stdDeviation", "3")
    .attr("result", "coloredBlur");

  const feMerge = filter.append("feMerge");

  feMerge.append("feMergeNode").attr("in", "coloredBlur");

  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  const label = svg
    .append("g")
    .attr("class", "labels") // add a class to the label group
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text") // create a text element for each node
    .text((d) => d.data.name) // set the text to the node's name
    .attr("dy", ".35em") // set the offset from the baseline
    .style("font-size", "20px") // set the font size
    .style("fill", "white") // set the font color to white
    .style("text-anchor", "middle") // center the text horizontally
    .attr("y", 25) // add an offset to the y-coordinate
    .attr("visibility", "hidden"); // hide the labels by default

  node
    .on("mouseover", function (event, d) {
      d3.select(this).style("filter", "url(#glow)"); // highlight the node by applying a filter
      d3.select(".labels text:nth-child(" + (d.index + 1) + ")") // select the corresponding label
        .attr("visibility", "visible"); // show the label
    })
    .on("mouseout", function (event, d) {
      d3.select(this).style("filter", null); // unhighlight the node by removing the filter
      d3.select(".labels text:nth-child(" + (d.index + 1) + ")") // select the corresponding label
        .attr("visibility", "hidden"); // hide the label
    });

  node
    .append("title")
    .text((d) => d.data.name) // Set the title of each node to its name
    .style("pointer-events", "none"); // Disable pointer events for the title

  simulation.on("tick", () => {
    // Add a tick event listener to the simulation
    link // Update the links based on the current position of the nodes
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node // Update the nodes based on the current position determined by the simulation
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);

    label.attr("transform", (d) => `translate(${d.x},${d.y})`); // Move the label text with the node
  });

  invalidation.then(() => simulation.stop()); // Stop the simulation when the invalidation promise resolves

  return svg.node(); // Return the SVG element node for the visualization
}

function _data(FileAttachment) {
  return FileAttachment("flare-2.json").json();
}

function _height() {
  return 800; // increase height of the svg container
}

function _drag(d3) {
  return (simulation) => {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };
}

function _d3(require) {
  return require("d3@6");
}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() {
    return this.url;
  }
  const fileAttachments = new Map([
    [
      "flare-2.json",
      {
        url: new URL(
          "./files/e65374209781891f37dea1e7a6e1c5e020a3009b8aedf113b4c80942018887a1176ad4945cf14444603ff91d3da371b3b0d72419fa8d2ee0f6e815732475d5de.json",
          import.meta.url
        ),
        mimeType: "application/json",
        toString,
      },
    ],
  ]);
  main.builtin(
    "FileAttachment",
    runtime.fileAttachments((name) => fileAttachments.get(name))
  );
  //main.variable(observer()).define(["md"], _1);
  main
    .variable(observer("chart"))
    .define(
      "chart",
      ["d3", "data", "width", "height", "drag", "invalidation"],
      _chart
    );
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer("height")).define("height", _height);
  main.variable(observer("drag")).define("drag", ["d3"], _drag);
  //main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
