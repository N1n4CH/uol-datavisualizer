function ClimateChange() {
    // Name for the visualisation to appear in the menu bar.
    this.name = "Climate Change";

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = "climate-change";

    // Names for each axis.
    this.xAxisLabel = "year";
    this.yAxisLabel = "℃";

    var marginSize = 35;

    // Layout object to store all common plot layout parameters and
    // methods.
    this.layout = {
        marginSize: marginSize,

        // Margin positions around the plot. Left and bottom have double
        // margin size to make space for axis and tick labels on the canvas.
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize,
        topMargin: marginSize + 50, // Extra space for title
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
        numXTickLabels: 8,
        numYTickLabels: 8,
    };

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function () {
        var self = this;
        this.data = loadTable(
            "./data/surface-temperature/surface-temperature.csv",
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

        if (!this.loaded) {
            console.log("Data not loaded in setup");
            return;
        }

        // Set min and max years: assumes data is sorted by year.
        this.minYear = this.data.getNum(0, "year");
        this.maxYear = this.data.getNum(this.data.getRowCount() - 1, "year");

        // Find min and max temperature for mapping to canvas height.
        this.minTemperature = min(this.data.getColumn("temperature"));
        this.maxTemperature = max(this.data.getColumn("temperature"));

        // Find mean temperature to plot average marker.
        this.meanTemperature = mean(this.data.getColumn("temperature"));

        console.log("Data loaded - Years:", this.minYear, "to", this.maxYear);
        console.log(
            "Temperature range:",
            this.minTemperature,
            "to",
            this.maxTemperature
        );

        // Create sliders to control start and end years. Default to
        // visualise full range.
        this.startSlider = createSlider(
            this.minYear,
            this.maxYear - 1,
            this.minYear,
            1
        );
        this.startSlider.position(400, 10);

        this.endSlider = createSlider(
            this.minYear + 1,
            this.maxYear,
            this.maxYear,
            1
        );
        this.endSlider.position(600, 10);

        // Add labels for sliders
        this.startLabel = createP("Start Year");
        this.startLabel.position(400, 30);
        this.startLabel.style("font-size", "12px");
        this.startLabel.style("margin", "0");

        this.endLabel = createP("End Year");
        this.endLabel.position(600, 30);
        this.endLabel.style("font-size", "12px");
        this.endLabel.style("margin", "0");
    };

    this.destroy = function () {
        if (this.startSlider) this.startSlider.remove();
        if (this.endSlider) this.endSlider.remove();
        if (this.startLabel) this.startLabel.remove();
        if (this.endLabel) this.endLabel.remove();
    };

    this.draw = function () {
        if (!this.loaded) {
            console.log("Data not yet loaded");
            return;
        }

        // Get current slider values
        this.startYear = this.startSlider.value();
        this.endYear = this.endSlider.value();

        // Prevent slider ranges overlapping.
        if (this.startYear >= this.endYear) {
            this.startSlider.value(this.endYear - 1);
            this.startYear = this.endYear - 1;
        }

        // Draw title
        this.drawTitle();

        // Draw all y-axis tick labels.
        drawYAxisTickLabels(
            this.minTemperature,
            this.maxTemperature,
            this.layout,
            this.mapTemperatureToHeight.bind(this),
            1
        );

        // Draw x and y axis.
        drawAxis(this.layout);

        // Draw x and y axis labels.
        drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);

        // Plot average line.
        stroke(150);
        strokeWeight(1);
        line(
            this.layout.leftMargin,
            this.mapTemperatureToHeight(this.meanTemperature),
            this.layout.rightMargin,
            this.mapTemperatureToHeight(this.meanTemperature)
        );

        // Add average line label
        fill(100);
        noStroke();
        textAlign("right", "center");
        textSize(10);
        text(
            "Average (" + this.meanTemperature.toFixed(2) + "°C)",
            this.layout.leftMargin - 10,
            this.mapTemperatureToHeight(this.meanTemperature)
        );

        // Draw the temperature data
        this.drawTemperatureData();

        // Display current range info
        this.displayRangeInfo();
    };

    this.drawTemperatureData = function () {
        var previous = null;
        var segmentWidth =
            this.layout.plotWidth() / (this.endYear - this.startYear);

        // First pass: draw background gradient rectangles
        for (var i = 0; i < this.data.getRowCount(); i++) {
            var current = {
                year: this.data.getNum(i, "year"),
                temperature: this.data.getNum(i, "temperature"),
            };

            // Only draw if within selected range
            if (
                current.year >= this.startYear &&
                current.year <= this.endYear
            ) {
                // Draw background gradient rectangle
                noStroke();
                fill(this.mapTemperatureToColour(current.temperature));

                var x = this.mapYearToWidth(current.year);
                rect(
                    x,
                    this.layout.topMargin,
                    segmentWidth,
                    this.layout.plotHeight()
                );
            }
        }

        // Second pass: draw the line
        previous = null;
        stroke(0);
        strokeWeight(2);

        for (var i = 0; i < this.data.getRowCount(); i++) {
            var current = {
                year: this.data.getNum(i, "year"),
                temperature: this.data.getNum(i, "temperature"),
            };

            // Only draw if within selected range
            if (
                current.year >= this.startYear &&
                current.year <= this.endYear
            ) {
                if (previous != null) {
                    // Draw line segment
                    line(
                        this.mapYearToWidth(previous.year),
                        this.mapTemperatureToHeight(previous.temperature),
                        this.mapYearToWidth(current.year),
                        this.mapTemperatureToHeight(current.temperature)
                    );
                }

                // Draw data points
                fill(0);
                noStroke();
                ellipse(
                    this.mapYearToWidth(current.year),
                    this.mapTemperatureToHeight(current.temperature),
                    4,
                    4
                );

                previous = current;
            } else if (current.year > this.endYear) {
                break; // No need to continue if we've passed the end year
            }
        }

        // Draw some year labels
        fill(0);
        noStroke();
        textAlign("center", "top");
        textSize(10);

        var yearStep = Math.max(
            1,
            Math.floor((this.endYear - this.startYear) / 8)
        );
        for (
            var year = this.startYear;
            year <= this.endYear;
            year += yearStep
        ) {
            var x = this.mapYearToWidth(year);
            text(year, x, this.layout.bottomMargin + 5);
        }
    };

    this.drawTitle = function () {
        fill(0);
        noStroke();
        textAlign("center", "center");
        textSize(18);
        text("Global Surface Temperature Anomalies", width / 2, 80);

        textSize(12);
        fill(100);
        text(
            "Temperature variations from long-term average (°C)",
            width / 2,
            95
        );
    };

    this.displayRangeInfo = function () {
        // Show current year range and some stats
        fill(0);
        noStroke();
        textAlign("left", "bottom");
        textSize(12);
        text(
            "Showing: " + this.startYear + " - " + this.endYear,
            this.layout.leftMargin,
            height - 5
        );

        // Show color legend
        textAlign("right", "bottom");
        text(
            "Blue = Cooler | Red = Warmer",
            this.layout.rightMargin,
            height - 5
        );
    };

    this.mapYearToWidth = function (value) {
        return map(
            value,
            this.startYear,
            this.endYear,
            this.layout.leftMargin,
            this.layout.rightMargin
        );
    };

    this.mapTemperatureToHeight = function (value) {
        return map(
            value,
            this.minTemperature,
            this.maxTemperature,
            this.layout.bottomMargin,
            this.layout.topMargin
        );
    };

    this.mapTemperatureToColour = function (value) {
        var red = map(
            value,
            this.minTemperature,
            this.maxTemperature,
            50, // Don't go to pure blue
            255
        );
        var blue = map(
            value,
            this.minTemperature,
            this.maxTemperature,
            255, // Pure blue for cold
            50
        ); // Little blue for warm
        return color(red, 0, blue, 150); // Semi-transparent
    };
}
