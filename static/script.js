
class CostOfLivingSituation {
    constructor(
        coefficient_path,
        sheet_names,
        age_categories,
        food_path,
        food_plans,
        housing_path,
        housing_plans
    ) {
        this.coefficient_path = coefficient_path;
        this.sheet_names = sheet_names;
        this.age_categories = age_categories;
        this.food_path = food_path;
        this.food_plans = food_plans;
        this.housing_path = housing_path;
        this.housing_plans = housing_plans;
        this.folks = [];
        this.housing_type = 0;
        this.food_plan = 0;
        this.food_cost = 0
        this.family_cost = [];
        this.chart = null;
    }

    async read_first_sheet(workbook_path) {
        const response = await fetch(workbook_path);
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        /* grab the first sheet's data as a JSON array */
        return XLSX.utils.sheet_to_json(workbook.Sheets[workbookSheetNames[0]]);
    }

    async get_values() {

        this.folks = AGE_CATEGORIES.map(
            (element_id) =>
                parseInt(document.getElementById(element_id).value)
        );

        this.housing_type = document.getElementById('housing').value;

        this.food_plan = document.getElementById('food_plan').value;

        await this.read_coefficients();
    }

    async read_coefficients() {
        const sheetData = await this.read_first_sheet(this.coefficient_path);
        this.family_cost = {};

        for (let i = 1; i < sheetData.length - 1; i++) {
            let cost_by_size = sheetData[i][1];
            for (let j = 0; j < folks.length; j++) {
                cost_by_size += sheetData[i][j + 2] * folks[j];
            }
            this.family_cost[sheetData[i][0]] = cost_by_size;
        }

        this.family_cost["housing_cost"] = await read_housing_plans();
        this.family_cost["food_cost"] = await read_food_plans();

        this.family_cost = family_cost_json;
    }

    async read_food_plans() {
        const food_plans_sheetData = await this.read_first_sheet(this.food_path);
        const food_row = this.food_plans.indexOf(food_plan) + 1;
        food_cost = folks.reduce(
            (total, val, j) => {
                total + food_plans_sheetData[food_row][j + 1] * val
            },
            0.0
        );

        // console.log(food_cost)
        // console.log(`Sheet: ${sheetName}`);
        // console.log(sheetData);

        return food_cost
    }

    async read_housing_plans() {
        const food_plans_sheetData = await this.read_first_sheet(this.housing_path);
        let housing_row = this.housing_plans.findIndex(housing_type) + 1;
        let housing_cost = housing_plans_sheetData[housing_row][2];

        // console.log(housing_cost)

        return housing_cost;
    }

    async render() {
        data = await this.get_values()
        // console.log("AAA")
        // console.log(Object.values(data))

        let table = {
            labels: Object.keys(data),
            datasets: [{
                label: 'Monthly Costs ($)',
                data: Object.values(data)
            }]
        }

        const ctx = document.getElementById('myChart').getContext('2d');

        if (this.chart) this.chart.destroy();

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: table,
            // options: {
            //   scales: {y: {beginAtZero: true}}
            // }
        });
    }

    // get_values()
    // readCoefficients()    
}

const sitch = new CostOfLivingSituation(
    "data/coefficients.xlsx",
    [
        "coefficients",
        "food_costs",
        "food_plans_means",
        "housing_costs"
    ],
    [
        "adults",
        "infants",
        "preschoolers",
        "schoolagers",
        "teenagers"
    ],
    "data/food_costs.xlsx",
    [
        "Thrifty",
        "Low",
        "Moderate",
        "Liberal"
    ],
    "data/housing_costs.xlsx",
    [
        "Efficiency",
        "One_Bedroom",
        "Two_Bedroom",
        "Three_Bedroom",
        "Four_Bedroom"
    ]
);

async function make_table() {
    await sitch.render();
}