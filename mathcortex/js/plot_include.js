var plot;

function plot_init(plotVar)
{
  var placeholder = $("#placeholder");
	plot = $.plot("#placeholder",
           [ { data: plotVar} ], {
				series: {
                   lines: { show: true },
                   points: { show: true, radius: 1 } // changed from 2 in mathcortex.com
				},
				grid: { hoverable: true },
				zoom: { interactive: true},
				pan: { interactive: true },
             });



	var previousPoint = null;
    $("#placeholder").bind("plothover", function (event, pos, item) {
        $("#x").text(pos.x.toFixed(4) + " " + pos.y.toFixed(4));

        if (true) {
            if (item) {
                if (previousPoint != item.dataIndex) {
                    previousPoint = item.dataIndex;

                    $("#tooltip").remove();
                    var x = item.datapoint[0].toFixed(4),
                        y = item.datapoint[1].toFixed(4);

                    showTooltip(item.pageX - 24, item.pageY - 36,
                                /*item.series.label +*/ " (" + x + ", " + y + ")");
                }
            }
            else {
                $("#tooltip").remove();
                previousPoint = null;
            }
        }
    });


}

function resetZoom (plotVar) {
	var flotVar = plot.getData();
	plot_init(flotVar[0].data);
  }

function showTooltip(x, y, contents)
{
	$('<div id="tooltip">' + contents + '</div>').css( {
		position: 'absolute',
		display: 'none',
		top: y + 5,
		left: x + 5,
		border: '1px solid #fdd',
		padding: '2px',
		'background-color': '#fee',
		opacity: 0.80
	}).appendTo("body").fadeIn(200);
}
