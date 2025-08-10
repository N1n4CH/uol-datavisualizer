function PayGapTimeSeries() {
    // Name for the visualisation to appear in the menu bar.
    this.name = "Pay gap: 1997-2017";

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = "pay-gap-timeseries";

    // Title to display above the plot.
    this.title =
        "Gender Pay Gap: Average difference between male and female pay.";

    // Names for each axis.
    this.xAxisLabel = "year";
    this.yAxisLabel = "%";

    var marginSize = 35;

    // Layout object to store all common plot layout parameters and
    // methods.
    this.layout = {
        marginSize: marginSize,

        // Margin positions around the plot. Left and bottom have double
        // margin size to make space for axis and tick labels on the canvas.
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize,
        topMargin: marginSize + 30, // Extra space for enhanced title
        bottomMargin: height - marginSize * 2,
        pad: 5,

        plotWidth: function () {
            return this.rightMargin - this.leftMargin;
        },

        plotHeight: function () {
            return this.bottomMargin - this.topMargin;
        },

        // Boolean to enable/disable background grid.
        grid: true,

        // Number of axis tick labels to draw so that they are not drawn on
        // top of one another.
        numXTickLabels: 10,
        numYTickLabels: 8,
    };

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function () {
        var self = this;
        this.data = loadTable(
            "./data/pay-gap/all-employees-hourly-pay-by-gender-1997-2017.csv",
            "csv",
            "header",
            // Callback function to set the value
            // this.loaded to true.
            function (table) {
                self.loaded = true;
            }
        );
    };

    this.setup = function () {
        // Font defaults.
        textSize(16);

        // Set min and max years: assumes data is sorted by date.
        this.startYear = this.data.getNum(0, "year");
        this.endYear = this.data.getNum(this.data.getRowCount() - 1, "year");

        // Find min and max pay gap for mapping to canvas height.
        this.minPayGap = 0; // Pay equality (zero pay gap).
        this.maxPayGap = max(this.data.getColumn("pay_gap"));
    };

    this.destroy = function () {};

    this.draw = function () {
        if (!this.loaded) {
            console.log("Data not yet loaded");
            return;
        }

        // Draw the enhanced title and context
        this.drawEnhancedTitle();

        // Draw all y-axis labels.
        drawYAxisTickLabels(
            this.minPayGap,
            this.maxPayGap,
            this.layout,
            this.mapPayGapToHeight.bind(this),
            1
        );

        // Draw x and y axis.
        drawAxis(this.layout);

        // Draw x and y axis labels.
        drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);

        // Draw pay equality reference line
        this.drawEqualityLine();

        // Plot all pay gaps between startYear and endYear using the width
        // of the canvas minus margins.
        var previous;
        var numYears = this.endYear - this.startYear;
        var dataPoints = []; // Store points for additional features

        // Loop over all rows and draw a line from the previous value to
        // the current.
        for (var i = 0; i < this.data.getRowCount(); i++) {
            // Create an object to store data for the current year.
            var current = {
                // COMPLETED: Extract year and pay gap data
                year: this.data.getNum(i, "year"),
                payGap: this.data.getNum(i, "pay_gap"),
                medianMale: this.data.getNum(i, "median_male"),
                medianFemale: this.data.getNum(i, "median_female"),
            };

            // Store data point for later use
            dataPoints.push(current);

            if (previous != null) {
                // Draw line segment connecting previous year to current
                // year pay gap with enhanced styling
                stroke(220, 20, 60); // Nice red color
                strokeWeight(2); // Thicker line
                line(
                    this.mapYearToWidth(previous.year),
                    this.mapPayGapToHeight(previous.payGap),
                    this.mapYearToWidth(current.year),
                    this.mapPayGapToHeight(current.payGap)
                );

                // The number of x-axis labels to skip so that only
                // numXTickLabels are drawn.
                var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

                // Draw the tick label marking the start of the previous year.
                if (i % xLabelSkip == 0) {
                    drawXAxisTickLabel(
                        previous.year,
                        this.layout,
                        this.mapYearToWidth.bind(this)
                    );
                }
            }

            // Assign current year to previous year so that it is available
            // during the next iteration of this loop to give us the start
            // position of the next line segment.
            previous = current;
        }

        // Draw data point markers
        this.drawDataPoints(dataPoints);

        // Draw key annotations
        this.drawAnnotations(dataPoints);

        // Draw trend summary
        this.drawTrendSummary(dataPoints);
    };

    this.drawEnhancedTitle = function () {
        fill(0);
        noStroke();
        textAlign("center", "center");

        // Main title
        textSize(18);
        text(
            this.title,
            this.layout.plotWidth() / 2 + this.layout.leftMargin,
            this.layout.topMargin - 15
        );

        // Subtitle with context
        textSize(12);
        fill(100);
        text(
            "Shows declining wage gap over 20-year period (higher percentage = larger gap)",
            this.layout.plotWidth() / 2 + this.layout.leftMargin,
            this.layout.topMargin
        );
    };

    this.drawEqualityLine = function () {
        // Draw a reference line at 0% (pay equality)
        stroke(0, 150, 0);
        strokeWeight(1);
        setLineDash([5, 5]); // Dashed line if supported
        line(
            this.layout.leftMargin,
            this.mapPayGapToHeight(0),
            this.layout.rightMargin,
            this.mapPayGapToHeight(0)
        );

        // Add label for equality line
        fill(0, 150, 0);
        noStroke();
        textAlign("right", "center");
        textSize(10);
        text(
            "Pay Equality",
            this.layout.leftMargin - 10,
            this.mapPayGapToHeight(0)
        );
    };

    this.drawDataPoints = function (dataPoints) {
        // Draw circles at each data point
        fill(220, 20, 60);
        stroke(255);
        strokeWeight(1);

        for (var i = 0; i < dataPoints.length; i++) {
            var point = dataPoints[i];
            var x = this.mapYearToWidth(point.year);
            var y = this.mapPayGapToHeight(point.payGap);

            ellipse(x, y, 6, 6);
        }
    };

    this.drawAnnotations = function (dataPoints) {
        if (dataPoints.length === 0) return;

        var firstPoint = dataPoints[0];
        var lastPoint = dataPoints[dataPoints.length - 1];

        fill(0);
        noStroke();
        textAlign("center", "top");
        textSize(10);

        // Annotate start point
        var startX = this.mapYearToWidth(firstPoint.year);
        var startY = this.mapPayGapToHeight(firstPoint.payGap);
        text(firstPoint.payGap.toFixed(1) + "%", startX, startY - 15);

        // Annotate end point
        var endX = this.mapYearToWidth(lastPoint.year);
        var endY = this.mapPayGapToHeight(lastPoint.payGap);
        text(lastPoint.payGap.toFixed(1) + "%", endX, endY - 15);
    };

    this.drawTrendSummary = function (dataPoints) {
        if (dataPoints.length < 2) return;

        var firstPoint = dataPoints[0];
        var lastPoint = dataPoints[dataPoints.length - 1];
        var improvement = firstPoint.payGap - lastPoint.payGap;
        var percentImprovement = (improvement / firstPoint.payGap) * 100;

        // Draw summary box
        fill(240, 240, 240);
        stroke(200);
        strokeWeight(1);
        rect(
            this.layout.rightMargin - 180,
            this.layout.topMargin + 20,
            175,
            80
        );

        fill(0);
        noStroke();
        textAlign("left", "top");
        textSize(11);
        text(
            "20-Year Summary:",
            this.layout.rightMargin - 175,
            this.layout.topMargin + 25
        );

        textSize(9);
        text(
            "1997: " + firstPoint.payGap.toFixed(1) + "% gap",
            this.layout.rightMargin - 175,
            this.layout.topMargin + 40
        );
        text(
            "2017: " + lastPoint.payGap.toFixed(1) + "% gap",
            this.layout.rightMargin - 175,
            this.layout.topMargin + 52
        );
        text(
            "Improvement: " + improvement.toFixed(1) + " percentage points",
            this.layout.rightMargin - 175,
            this.layout.topMargin + 64
        );
        text(
            "(" + percentImprovement.toFixed(0) + "% reduction)",
            this.layout.rightMargin - 175,
            this.layout.topMargin + 76
        );
    };

    this.mapYearToWidth = function (value) {
        return map(
            value,
            this.startYear,
            this.endYear,
            this.layout.leftMargin, // Draw left-to-right from margin.
            this.layout.rightMargin
        );
    };

    // COMPLETED: Map pay gap to height
    this.mapPayGapToHeight = function (value) {
        return map(
            value,
            this.minPayGap,
            this.maxPayGap,
            this.layout.bottomMargin, // Higher pay gap at bottom.
            this.layout.topMargin
        ); // Lower pay gap at top.
    };

    // Helper function for dashed lines (if browser supports it)
    function setLineDash(segments) {
        if (drawingContext.setLineDash) {
            drawingContext.setLineDash(segments);
        }
    }
}
