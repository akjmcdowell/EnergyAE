let jsonData = []; // Declare jsonData at the top
    let data_VEU = [];
    let data_postcodes = [];
    let currentSortColumn = -1; // Keep track of the currently sorted column
    let currentSortDirection = 'ascending'; // Keep track of the sorting direction
    let calculatedValues = [];

    let EEF, EEFm, AF_1D, SEF_1D, AEF_1D, AF_3C, SEF_3C, AEF_3C;
    
    main();

    async function main() {
        try {
            data_VEU = await fetchData('https://raw.githubusercontent.com/akjmcdowell/EnergyAE/refs/heads/main/VEU_1D3C/VEU_1D3C.json');
            data_postcodes = await fetchData('https://raw.githubusercontent.com/akjmcdowell/EnergyAE/refs/heads/main/VEU_1D3C/Postcodes.json');

            if (!Array.isArray(data_VEU)) throw new Error('data_VEU is not an array');

            populateTable(data_VEU); // Populate the table initially
            populateBrandFilter(data_VEU); // Populate the brand filter
            populateModelFilter(data_VEU); // Populate the model filter
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }

    async function fetchData(URL) {
        const response = await fetch(URL);
        if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
        return await response.json();
    }

    function updateVEUParameters() {
        const location = document.getElementById("location").value;
        const year = document.getElementById("year").value;

        switch (year) {
            case "2024":
                EEF = 0.5334;
                EEFm = 0.433;
                break;
            case "2025":
                EEF = 0.393;
                EEFm = 0.393;
                break;
            default:
                EEF = 0.5334;
                EEFm = 0.433;
        }

        switch (location) {
            case "metropolitan":
                AF_1D = 33.4;
                SEF_1D = 3.27;
                AEF_1D = 3.27;
                AF_3C = 13.23;
                SEF_3C = 4.17;
                AEF_3C = 4.17;
                break;
            case "regional":
                AF_1D = 35.44;
                SEF_1D = 3.47;
                AEF_1D = 3.47;
                AF_3C = 13.23;
                SEF_3C = 4.17;
                AEF_3C = 4.17;
                break;
        }
    }

       // Function to populate the table with data
       function populateTable(data) {
        const tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = ''; // Clear existing data
        updateVEUParameters();
        
        data.forEach(item => {
            const row = document.createElement('tr');         
            
            let Bs_Z4 = item["Zone 4 Bs (GJ\/year) (step down load size)"];
            let Bs_Z5 = item["Zone 5 Bs (GJ\/year) (step down load size)"];
            let Be_Z4 = item["Zone 4 Be (GJ\/year) (step down load size)"];
            let Be_Z5 = item["Zone 5 Be (GJ\/year) (step down load size)"];
            
            // Create individual cells (td) and assign values
            let brandCell = document.createElement('td');
            brandCell.textContent = item.Brand;

            let modelCell = document.createElement('td');
            modelCell.textContent = item.Model;

            let VEEC_1D_Z4 = document.createElement('td');
            let VEEC_1D_Z5 = document.createElement('td');
            let VEEC_3C_Z4 = document.createElement('td');
            let VEEC_3C_Z5 = document.createElement('td');

            // Calculate VEEC values
            VEEC_1D_Z4.textContent = Bs_Z4 > 0 ? Math.round((AF_1D - SEF_1D * Bs_Z4 - AEF_1D * Be_Z4) * EEF) : 0;
            VEEC_3C_Z4.textContent = Bs_Z4 > 0 ? Math.round(AF_3C - (SEF_3C * Bs_Z4 + AEF_3C * Be_Z4) * EEFm) : 0;

            VEEC_1D_Z5.textContent = Bs_Z5 > 0 ? Math.round((AF_1D - SEF_1D * Bs_Z5 - AEF_1D * Be_Z5) * EEF) : 0;
            VEEC_3C_Z5.textContent = Bs_Z5 > 0 ? Math.round(AF_3C - (SEF_3C * Bs_Z5 + AEF_3C * Be_Z5) * EEFm) : 0;

            // Append cells to the row
            row.appendChild(brandCell);
            row.appendChild(modelCell);
            row.appendChild(VEEC_1D_Z4);
            row.appendChild(VEEC_1D_Z5);
            row.appendChild(VEEC_3C_Z4);
            row.appendChild(VEEC_3C_Z5);

            // Append the row to the table body
            tableBody.appendChild(row);

            // Store calculated values in the array
            calculatedValues.push({
                brand: item.Brand,
                model: item.Model,
                VEEC_1D_Z4: VEEC_1D_Z4.textContent,
                VEEC_1D_Z5: VEEC_1D_Z5.textContent,
                VEEC_3C_Z4: VEEC_3C_Z4.textContent,
                VEEC_3C_Z5: VEEC_3C_Z5.textContent
            });
        });
    }

    function populateBrandFilter(data) {
    const brandFilter = document.getElementById('brand-filter');
    brandFilter.innerHTML = ''; // Clear existing brands

    // Add the default "All Brands" option
    const allBrandsOption = document.createElement('option');
    allBrandsOption.value = 'all-brands';
    allBrandsOption.textContent = 'All Brands';
    brandFilter.appendChild(allBrandsOption);

    const uniqueBrands = [...new Set(data.map(item => item.Brand))].sort();

    uniqueBrands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });
}

function populateModelFilter(data, selectedBrands = []) {
    const modelFilter = document.getElementById('model-filter');
    modelFilter.innerHTML = ''; // Clear existing models

    // Add the default "All Models" option
    const allModelsOption = document.createElement('option');
    allModelsOption.value = 'all-models';
    allModelsOption.textContent = 'All Models';
    modelFilter.appendChild(allModelsOption);

    const filteredModels = selectedBrands.includes('all-brands') 
        ? data.map(item => item.Model) // Show all models if "All Brands" is selected
        : data.filter(item => selectedBrands.includes(item.Brand)).map(item => item.Model);

    const uniqueModels = [...new Set(filteredModels)].sort();

    uniqueModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelFilter.appendChild(option);
    });
}


function updateTableForSelectedBrandsModels() {
    const selectedBrands = Array.from(document.getElementById('brand-filter').selectedOptions).map(option => option.value);
    const selectedModels = Array.from(document.getElementById('model-filter').selectedOptions).map(option => option.value);

    let filteredData;

    if (selectedBrands.includes('all-brands') && selectedModels.includes('all-models')) {
        // Show all data if both "All Brands" and "All Models" are selected
        filteredData = data_VEU;
    } else if (selectedBrands.includes('all-brands')) {
        // If "All Brands" is selected, show all models for selected models
        filteredData = data_VEU.filter(item => selectedModels.includes(item.Model));
    } else if (selectedModels.includes('all-models')) {
        // If "All Models" is selected, show all models for selected brands
        filteredData = data_VEU.filter(item => selectedBrands.includes(item.Brand));
    } else {
        // Filter by both selected brands and models
        filteredData = data_VEU.filter(item =>
            selectedBrands.includes(item.Brand) && selectedModels.includes(item.Model)
        );
    }

    populateTable(filteredData); // Update the table with filtered data
}


        // Example of populating filters and updating table on selection change
    document.getElementById('brand-filter').addEventListener('change', function() {
        const selectedBrands = Array.from(this.selectedOptions).map(option => option.value);
        populateModelFilter(data_VEU, selectedBrands);

        // Automatically select "All Models" when a brand is selected
        const modelFilter = document.getElementById('model-filter');
        modelFilter.value = 'all-models'; // Set to "All Models"

        updateTableForSelectedBrandsModels();
    });

    document.getElementById('model-filter').addEventListener('change', updateTableForSelectedBrandsModels);

    function sortTable(columnIndex, th) {
        const table = document.getElementById('data-table');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.rows);
        
        // Determine sort direction
        let sortDirection = 'descending'; // Default direction
        if (currentSortColumn === columnIndex) {
            // Toggle sort direction if clicking the same column
            sortDirection = currentSortDirection === 'ascending' ? 'descending' : 'ascending';
        } else {
            // Sort descending on the first click
            sortDirection = currentSortColumn === -1 ? 'descending' : 'ascending';
        }

        // Sort rows based on selected column
        rows.sort((rowA, rowB) => {
            const cellA = rowA.cells[columnIndex].innerText;
            const cellB = rowB.cells[columnIndex].innerText;

            const a = isNaN(cellA) ? cellA : parseFloat(cellA);
            const b = isNaN(cellB) ? cellB : parseFloat(cellB);

            return sortDirection === 'ascending' ? (a > b ? 1 : -1) : (a < b ? 1 : -1);
        });

        // Clear existing rows and append sorted rows
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }
        rows.forEach(row => tbody.appendChild(row));

        // Update sorting indicators
        resetSortingIndicators();
        th.classList.toggle(sortDirection);
        currentSortColumn = columnIndex;
        currentSortDirection = sortDirection;
    }

    function resetSortingIndicators() {
        const thElements = document.querySelectorAll('#data-table th');
        thElements.forEach(th => {
            th.classList.remove('ascending', 'descending'); // Remove sorting classes
        });
    }

    function lookupPostcode() {
        const postcodeInput = document.getElementById('postcode').value.trim();
        const resultDiv = document.getElementById('result');

        // Find the postcode in the data
        const postcodeInfo = data_postcodes.find(item => item.Postcode === postcodeInput);

        if (postcodeInfo) {
            // Display the results
            resultDiv.innerHTML = `
                <strong>State:</strong> ${postcodeInfo.State} <br>
                <strong>Location:</strong> ${postcodeInfo.Location} <br>
                <strong>VEU Zone:</strong> ${postcodeInfo.Zone_VEU} <br>
            `;

            // Change the location dropdown selection based on the postcode
            const locationDropdown = document.getElementById('location');
            locationDropdown.value = postcodeInfo.Location.toLowerCase(); // Convert to lowercase to match dropdown values

            // Trigger change event to update the VEU parameters and table
            locationDropdown.dispatchEvent(new Event('change'));
        } else {
            // Display error message
            resultDiv.innerHTML = `<strong>No data found for postcode:</strong> ${postcodeInput}`;
        }

            const selectedBrands = Array.from(document.getElementById('brand-filter').selectedOptions).map(option => option.value);
            const selectedModels = Array.from(document.getElementById('model-filter').selectedOptions).map(option => option.value);

                // Default to "all-brands" and "all-models" if none selected
            if (selectedBrands.length === 0) {
                selectedBrands.push('all-brands');
            }
            if (selectedModels.length === 0) {
        selectedModels.push('all-models');
    }

               // Filter the data based on current selections
    const filteredData = (selectedBrands.includes('all-brands') && selectedModels.includes('all-models'))
        ? data_VEU
        : data_VEU.filter(item =>
            (selectedBrands.includes('all-brands') || selectedBrands.includes(item.Brand)) &&
            (selectedModels.includes('all-models') || selectedModels.includes(item.Model))
        );

    populateTable(filteredData); // Update table with filtered data

    }

    // Add event listener for button click
    document.getElementById('lookup-button').addEventListener('click', lookupPostcode);

    // Add event listener for Enter key press
    document.getElementById('postcode').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            lookupPostcode();
        }
    });

    // Event listeners for dropdown changes
    document.getElementById('location').addEventListener('change', function() {
        updateVEUParameters(); // Update parameters on location change
        const selectedBrand = document.getElementById('brand-filter').value;
        const selectedModel = document.getElementById('model-filter').value;

        const filteredData = (selectedBrand === 'all-brands' && selectedModel === 'all-models')
            ? data_VEU
            : data_VEU.filter(item => 
                (selectedBrand === 'all-brands' || item.Brand === selectedBrand) && 
                (selectedModel === 'all-models' || item.Model === selectedModel)
            );

        populateTable(filteredData); // Update table with filtered data
    });

    document.getElementById('year').addEventListener('change', function() {
    updateVEUParameters(); // Update parameters on year change

    const selectedBrands = Array.from(document.getElementById('brand-filter').selectedOptions).map(option => option.value);
    const selectedModels = Array.from(document.getElementById('model-filter').selectedOptions).map(option => option.value);

    // Default to "all-brands" and "all-models" if none selected
    if (selectedBrands.length === 0) {
        selectedBrands.push('all-brands');
    }
    if (selectedModels.length === 0) {
        selectedModels.push('all-models');
    }

    // Filter data based on selections
    const filteredData = (selectedBrands.includes('all-brands') && selectedModels.includes('all-models'))
        ? data_VEU
        : data_VEU.filter(item =>
            (selectedBrands.includes('all-brands') || selectedBrands.includes(item.Brand)) &&
            (selectedModels.includes('all-models') || selectedModels.includes(item.Model))
        );

    populateTable(filteredData); // Update table with filtered data
});

function exportExcel() {
        // Get the table element
        const table = document.getElementById('data-table');

        // Create a new workbook
        const wb = XLSX.utils.book_new();
        
        // Convert the HTML table to a worksheet
        const ws = XLSX.utils.table_to_sheet(table);
        
        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

        // Export the workbook as an Excel file
        // Create a date string in the format YYYY-MM-DD
        const today = new Date();
        const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        XLSX.writeFile(wb, `VEEC_1D3C_data_${dateString}.xlsx`);
    }

    document.getElementById('export-button').addEventListener('click', function () {
        exportExcel();
    });