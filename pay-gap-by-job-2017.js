function PayGapByJob2017() {
    // Name for the visualisation to appear in the menu bar.
    this.name = "Pay gap by job: 2017";

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = "pay-gap-by-job-2017";

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Graph properties.
    this.pad = 60; // Increased padding for labels
    this.dotSizeMin = 15;
    this.dotSizeMax = 40;

    // Colors for different job categories
    this.colors = [
        color(255, 100, 100), // Tech - Red
        color(100, 255, 100), // Creative - Green
        color(100, 100, 255), // Business - Blue
        color(255, 255, 100), // Finance - Yellow
        color(255, 100, 255), // Operations - Magenta
        color(100, 255, 255), // Legal - Cyan
        color(255, 150, 100), // Healthcare - Orange
        color(150, 255, 100), // Education - Light Green
        color(200, 100, 255), // Retail - Purple
        color(255, 200, 100), // Service - Peach
        color(100, 200, 255), // Manual - Light Blue
        color(200, 200, 100), // Transport - Olive
    ];

    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function () {
        var self = this;
        this.data = loadTable(
            "./data/pay-gap/occupation-hourly-pay-by-gender-2017.csv",
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
        textSize(12);
    };

    this.destroy = function () {};

    this.draw = function () {
        if (!this.loaded) {
            console.log("Data not yet loaded");
            return;
        }

        // Draw title
        this.drawTitle();

        // Draw the axes with labels
        this.addAxes();

        // Get data from the table object.
        var jobs = this.data.getColumn("job_subtype");
        var propFemale = this.data.getColumn("proportion_female");
        var payGap = this.data.getColumn("pay_gap");
        var numJobs = this.data.getColumn("num_jobs");

        // Convert numerical data from strings to numbers.
        propFemale = stringsToNumbers(propFemale);
        payGap = stringsToNumbers(payGap);
        numJobs = stringsToNumbers(numJobs);

        // Set ranges for axes.
        var propFemaleMin = 0;
        var propFemaleMax = 100;
        var payGapMin = -20;
        var payGapMax = 20;

        // Find smallest and largest numbers of people across all
        // categories to scale the size of the dots.
        var numJobsMin = min(numJobs);
        var numJobsMax = max(numJobs);

        stroke(0);
        strokeWeight(1);

        for (i = 0; i < this.data.getRowCount(); i++) {
            // Map data to screen coordinates
            var x = map(
                propFemale[i],
                propFemaleMin,
                propFemaleMax,
                this.pad,
                width - this.pad
            );
            var y = map(
                payGap[i],
                payGapMin,
                payGapMax,
                height - this.pad,
                this.pad
            );
            var size = map(
                numJobs[i],
                numJobsMin,
                numJobsMax,
                this.dotSizeMin,
                this.dotSizeMax
            );

            // Color based on job type code
            var jobTypeCode = this.data.getNum(i, "job_type_code");
            fill(this.colors[jobTypeCode % this.colors.length]);

            // Draw the circle
            ellipse(x, y, size, size);

            // Add job label near the circle
            fill(0);
            noStroke();
            textAlign("center", "center");
            textSize(8);
            text(jobs[i], x, y + size / 2 + 10);
        }

        // Draw legend
        this.drawLegend();
    };

    this.drawTitle = function () {
        fill(0);
        noStroke();
        textAlign("center", "center");
        textSize(16);
        text("Pay Gap vs Gender Representation by Job (2017)", width / 2, 20);

        textSize(12);
        text("Circle size = Number of jobs", width / 2, 35);
    };

    this.addAxes = function () {
        stroke(150);
        strokeWeight(2);

        // Add vertical line at 50% (gender parity)
        line(width / 2, this.pad, width / 2, height - this.pad);

        // Add horizontal line at 0% pay gap (pay equality)
        line(this.pad, height / 2, width - this.pad, height / 2);

        // Add axis labels
        fill(0);
        noStroke();
        textAlign("center", "center");
        textSize(14);

        // X-axis label
        text("Proportion of Female Employees (%)", width / 2, height - 15);

        // Y-axis label
        push();
        translate(15, height / 2);
        rotate(-PI / 2);
        text("Pay Gap (%)", 0, 0);
        pop();

        // Add axis tick labels
        textSize(10);

        // X-axis ticks
        textAlign("center", "top");
        for (var i = 0; i <= 100; i += 25) {
            var x = map(i, 0, 100, this.pad, width - this.pad);
            text(i + "%", x, height - this.pad + 5);
        }

        // Y-axis ticks
        textAlign("right", "center");
        for (var i = -20; i <= 20; i += 10) {
            var y = map(i, -20, 20, height - this.pad, this.pad);
            text(i + "%", this.pad - 5, y);
        }

        // Add quadrant labels
        textAlign("center", "center");
        textSize(11);
        fill(100);

        // Top right quadrant
        text("Male-dominated\nMen paid more", width * 0.75, this.pad + 30);

        // Top left quadrant
        text("Female-dominated\nMen paid more", width * 0.25, this.pad + 30);

        // Bottom right quadrant
        text(
            "Male-dominated\nWomen paid more",
            width * 0.75,
            height - this.pad - 30
        );

        // Bottom left quadrant
        text(
            "Female-dominated\nWomen paid more",
            width * 0.25,
            height - this.pad - 30
        );
    };

    this.drawLegend = function () {
        // Draw a simple legend showing circle sizes
        var legendX = width - 150;
        var legendY = 80;

        fill(0);
        noStroke();
        textAlign("left", "center");
        textSize(12);
        text("Circle Size Legend:", legendX, legendY);

        // Show small, medium, large circles
        fill(150);
        stroke(0);
        strokeWeight(1);

        ellipse(legendX + 20, legendY + 20, this.dotSizeMin, this.dotSizeMin);
        ellipse(
            legendX + 20,
            legendY + 40,
            (this.dotSizeMin + this.dotSizeMax) / 2,
            (this.dotSizeMin + this.dotSizeMax) / 2
        );
        ellipse(legendX + 20, legendY + 65, this.dotSizeMax, this.dotSizeMax);

        fill(0);
        noStroke();
        textAlign("left", "center");
        textSize(10);
        text("Fewer jobs", legendX + 35, legendY + 20);
        text("Medium", legendX + 35, legendY + 40);
        text("More jobs", legendX + 35, legendY + 65);
    };
}
