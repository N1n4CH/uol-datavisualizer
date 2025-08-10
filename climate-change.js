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
        topMargin: marginSize + 50,
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

    // Fallback hardcoded data in case CSV fails
    this.fallbackData = [
        { year: 1880, temperature: -0.2 },
        { year: 1885, temperature: -0.25 },
        { year: 1890, temperature: -0.3 },
        { year: 1895, temperature: -0.22 },
        { year: 1900, temperature: -0.1 },
        { year: 1905, temperature: -0.28 },
        { year: 1910, temperature: -0.4 },
        { year: 1915, temperature: -0.15 },
        { year: 1920, temperature: -0.2 },
        { year: 1925, temperature: -0.18 },
        { year: 1930, temperature: -0.12 },
        { year: 1935, temperature: -0.15 },
        { year: 1940, temperature: 0.05 },
        { year: 1945, temperature: -0.02 },
        { year: 1950, temperature: -0.18 },
        { year: 1955, temperature: -0.15 },
        { year: 1960, temperature: -0.05 },
        { year: 1965, temperature: -0.12 },
        { year: 1970, temperature: 0.02 },
        { year: 1975, temperature: -0.05 },
        { year: 1980, temperature: 0.25 },
        { year: 1985, temperature: 0.1 },
        { year: 1990, temperature: 0.42 },
        { year: 1995, temperature: 0.43 },
        { year: 2000, temperature: 0.58 },
        { year: 2005, temperature: 0.65 },
        { year: 2010, temperature: 0.7 },
        { year: 2015, temperature: 0.85 },
        { year: 2020, temperature: 1.02 },
    ];

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
                console.log("CSV loaded successfully");
                self.loaded = true;
            },
            // Error callback - use fallback data
            function (error) {
                console.log("CSV loading failed, using fallback data:", error);
                self.loaded = true; // Still set to true so app works
                self.usesFallback = true;
            }
        );
    };

    this.setup = function () {
        textSize(16);

        // Convert CSV data to simple array format, or use fallback
        this.processedData = [];

        if (
            this.data &&
            this.data.getRowCount &&
            this.data.getRowCount() > 0 &&
            !this.usesFallback
        ) {
            console.log("Using CSV data with", this.data.getRowCount(), "rows");

            // Convert CSV to simple array
            for (var i = 0; i < this.data.getRowCount(); i++) {
                this.processedData.push({
                    year: this.data.getNum(i, "year"),
                    temperature: this.data.getNum(i, "temperature"),
                });
            }

            this.dataSource = "CSV";
        } else {
            console.log(
                "Using fallback data with",
                this.fallbackData.length,
                "points"
            );
            this.processedData = this.fallbackData;
            this.dataSource = "Fallback";
        }

        // Calculate data ranges
        this.minYear = Math.min(...this.processedData.map((d) => d.year));
        this.maxYear = Math.max(...this.processedData.map((d) => d.year));
        this.minTemperature = Math.min(
            ...this.processedData.map((d) => d.temperature)
        );
        this.maxTemperature = Math.max(
            ...this.processedData.map((d) => d.temperature)
        );
        this.meanTemperature =
            this.processedData.reduce((sum, d) => sum + d.temperature, 0) /
            this.processedData.length;

        console.log("Data processed - Source:", this.dataSource);
        console.log("Years:", this.minYear, "to", this.maxYear);
        console.log(
            "Temperature range:",
            this.minTemperature,
            "to",
            this.maxTemperature
        );
        console.log("Data points:", this.processedData.length);

        // Create sliders
        this.startSlider = createSlider(
            this.minYear,
            this.maxYear - 5,
            this.minYear,
            1
        );
        this.startSlider.position(400, 10);

        this.endSlider = createSlider(
            this.minYear + 5,
            this.maxYear,
            this.maxYear,
            1
        );
        this.endSlider.position(600, 10);

        // Add labels for sliders
        this.startLabel = createP("Start Year");
        this.startLabel.position(400, 30);
        this.startLabel.style("font-size", "12px");

        this.endLabel = createP("End Year");
        this.endLabel.position(600, 30);
        this.endLabel.style("font-size", "12px");
    };

    this.destroy = function () {
        if (this.startSlider) this.startSlider.remove();
        if (this.endSlider) this.endSlider.remove();
        if (this.startLabel) this.startLabel.remove();
        if (this.endLabel) this.endLabel.remove();
    };

    this.draw = function () {
        if (
            !this.loaded ||
            !this.processedData ||
            this.processedData.length === 0
        ) {
            console.log("Data not ready for drawing");
            return;
        }

        // Get current slider values
        this.startYear = this.startSlider.value();
        this.endYear = this.endSlider.value();

        // Prevent slider ranges overlapping
        if (this.startYear >= this.endYear) {
            this.startSlider.value(this.endYear - 5);
            this.startYear = this.endYear - 5;
        }

        // Draw title
        fill(0);
        noStroke();
        textAlign("center", "center");
        textSize(18);
        text("Global Surface Temperature Anomalies", width / 2, 50);

        textSize(12);
        fill(100);
        text(
            "Temperature variations from long-term average (°C) - " +
                this.dataSource +
                " Data",
            width / 2,
            95
        );

        // Draw axes
        drawAxis(this.layout);
        drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);

        // Draw y-axis labels
        drawYAxisTickLabels(
            this.minTemperature,
            this.maxTemperature,
            this.layout,
            this.mapTemperatureToHeight.bind(this),
            1
        );

        // Draw average line
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

        // Draw the temperature visualization
        this.drawTemperatureVisualization();

        // Show info
        fill(0);
        noStroke();
        textAlign("left", "bottom");
        textSize(10);
        text(
            "Showing: " +
                this.startYear +
                " - " +
                this.endYear +
                " | Data points: " +
                this.processedData.length +
                " (" +
                this.dataSource +
                ")",
            this.layout.leftMargin,
            height - 5
        );
    };

    this.drawTemperatureVisualization = function () {
        // Filter data to selected range
        var filteredData = this.processedData.filter(
            (d) => d.year >= this.startYear && d.year <= this.endYear
        );

        if (filteredData.length === 0) return;

        var segmentWidth =
            this.layout.plotWidth() / (this.endYear - this.startYear);

        // First pass: draw gradient background
        noStroke();
        for (var i = 0; i < filteredData.length; i++) {
            var dataPoint = filteredData[i];
            fill(this.mapTemperatureToColour(dataPoint.temperature));

            var x = this.mapYearToWidth(dataPoint.year);
            rect(
                x - segmentWidth / 2,
                this.layout.topMargin,
                segmentWidth,
                this.layout.plotHeight()
            );
        }

        // Second pass: draw temperature line
        var previous = null;
        stroke(0, 0, 150);
        strokeWeight(2);

        for (var i = 0; i < filteredData.length; i++) {
            var dataPoint = filteredData[i];
            var x = this.mapYearToWidth(dataPoint.year);
            var y = this.mapTemperatureToHeight(dataPoint.temperature);

            // Draw line to previous point
            if (previous != null) {
                line(previous.x, previous.y, x, y);
            }

            // Draw data point
            fill(0, 0, 150);
            noStroke();
            ellipse(x, y, 6, 6);

            previous = { x: x, y: y };
        }

        // Draw some year labels on x-axis
        fill(0);
        noStroke();
        textAlign("center", "top");
        textSize(10);

        var yearStep = Math.max(
            5,
            Math.floor((this.endYear - this.startYear) / 8)
        );
        for (
            var year = this.startYear;
            year <= this.endYear;
            year += yearStep
        ) {
            if (filteredData.some((d) => d.year === year)) {
                var x = this.mapYearToWidth(year);
                text(year, x, this.layout.bottomMargin + 5);
            }
        }
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
        var red = map(value, this.minTemperature, this.maxTemperature, 80, 255);
        var blue = map(
            value,
            this.minTemperature,
            this.maxTemperature,
            255,
            80
        );
        return color(red, 0, blue, 120);
    };
}
