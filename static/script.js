
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
        this.family_cost = {};   
    }

    async read_first_sheet(workbook_path) {
        const response = await fetch(workbook_path);
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array'});
        /* grab the first sheet's data as a JSON array */


        // console.log(workbook)
        // console.log(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]))
        return XLSX.utils.sheet_to_json(workbook.Sheets[0], {header:1});
    }

    async get_values() {

        this.folks = this.age_categories.map(
            (element_id) =>
                parseInt(document.getElementById(element_id).value)
        );

        this.housing_type = document.getElementById('housing').value;

        this.food_plan = document.getElementById('food_plan').value;


        await this.read_coefficients();
    }

    async read_coefficients() {
        const sheetData = await this.read_first_sheet(this.coefficient_path);
        // console.log(sheetData[1])

        console.log((typeof sheetData))

        // this.family_cost = new Map();
        // let cost_by_size ;


        for (let i = 0; i < sheetData.length ; i++) {

            // console.log(sheetData)
            // show this to Ben! 
            // https://stackoverflow.com/questions/29032525/how-to-access-first-element-of-json-object-array


            // intercepts
            let cost_by_size = sheetData[i][Object.keys(sheetData[i])[1]]
            // console.log(cost_by_size)

            // console.log(String(Object.keys(sheetData[0])[1]))
            let k = 0;
            for (let j = 2; j < this.folks.length +2; j++) {
                
                cost_by_size += ((Number(sheetData[i][Object.keys(sheetData[i])[j]])) * (Number(this.folks[k])));

                // console.log(cost_by_size)
                k = k+1
                // console.log(sheetData[i][Object.keys(sheetData[i])[j]])
                // cost_by_size += sheetData[i][j + 2] * this.folks[j];
            }
            // console.log("-------------------")
            this.family_cost[String(sheetData[i][Object.keys(sheetData[i])[0]])] = cost_by_size;
        }
        
        // console.log(this.family_cost)
        // console.log(cost_by_size)

        this.family_cost["housing_cost"] = await this.read_housing_plans();
        this.family_cost["food_cost"] = await this.read_food_plans();

        // console.log(this.family_cost)
    }

    async read_food_plans() {
        const food_plans_sheetData = await this.read_first_sheet(this.food_path);

        let food_row = food_plans_sheetData.findIndex(
            row => row["cost_group"] === this.food_plan
        );

        let total = 0;

        for (let i = 1; i < food_plans_sheetData.length +2; i++){
            total += Number(Object.values(food_plans_sheetData[food_row])[i]) *  Number(this.folks[i-1]) ;
            // console.log(total);
        }

        // var food_cost = this.folks.reduce(
        //     (total, val, j) => {
        //         total + (Object.values(food_plans_sheetData[food_row]))[j] * val
        //         console.log(j)
        //     },
        //     0.0
        // );
        

        // console.log((Object.values(food_plans_sheetData[food_row]))[1] );
        // console.log(total);

    


        // console.log(`Sheet: ${sheetName}`);
        // console.log(sheetData);

        return total
    }

    async read_housing_plans() {
        const housing_plans_sheetData = await this.read_first_sheet(this.housing_path);

         let housing_row = housing_plans_sheetData.findIndex(
            row => row["housing_type"] === this.housing_type
        );
        // console.log(housing_plans_sheetData[housing_row])
        
        let cost = Object.values(housing_plans_sheetData[housing_row])[2];
        // console.log(cost)

        // let housing_row = this.housing_plans.indexOf(this.housing_type) + 1;
        // let housing_cost = housing_plans_sheetData[housing_row][2];

        // console.log(housing_cost)

        return cost;
    }
    

    async render() {
        await this.get_values()
        // console.log("AAA")
        // console.log(Object.values(data))

        const total_monthly_cost = Object.values(this.family_cost).reduce((sum, val) => sum + Number(val), 0);

        console.log(total_monthly_cost);

      
        (document.getElementById('yearly_cost_div').innerHTML = ((total_monthly_cost * 12)).toFixed(2)).toLocaleString('en');
        (document.getElementById('monthly_cost_div').innerHTML = total_monthly_cost.toFixed(2)).toLocaleString('en');

        // Asuming 40 hours of work per week
        // On average there's 4 weeks and 2 days in a month, so 4.34524 weeks
        (document.getElementById('hourly_cost_div').innerHTML = ((total_monthly_cost / 4.34524) / 40).toFixed(2)).toLocaleString('en');



        const table = {
            labels: Object.keys(this.family_cost),
            datasets: [{
                label: 'Monthly Costs ($)',
                data: Object.values(this.family_cost)
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

let sitch = new CostOfLivingSituation(
    "data/coefficients.xlsx",
    [
        "coefficients",
        "food_costs",
        "food_plans_means",
        "housing_cost"
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
    "data/housing_cost.xlsx",
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