 const expenseTableBody = document.getElementById('expenseTableBody');
 const totalElement = document.getElementById('total');
 const container = document.querySelector('.container');

 let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
 updateTable();

 function addExpense() {
     const date = document.getElementById('date').value;
     const provider = document.getElementById('provider').value;
     const description = document.getElementById('description').value;
     const amount = parseFloat(document.getElementById('amount').value);

     if (!date || !provider || !description || isNaN(amount)) {
         alert("Please fill in all fields correctly.");
         return;
     }

     const newExpense = {
         date,
         provider,
         description,
         amount
     };
     expenses.push(newExpense);
     localStorage.setItem('expenses', JSON.stringify(expenses));
     updateTable();

     document.getElementById('date').value = '';
     document.getElementById('provider').value = '';
     document.getElementById('description').value = '';
     document.getElementById('amount').value = '';
 }

 function deleteExpense(index) {
     expenses.splice(index, 1);
     localStorage.setItem('expenses', JSON.stringify(expenses));
     updateTable();
 }

 function updateTable() {
     expenseTableBody.innerHTML = '';
     let total = 0;

     expenses.forEach((expense, index) => {
         const row = expenseTableBody.insertRow();
         const dateCell = row.insertCell();
         const providerCell = row.insertCell();
         const descriptionCell = row.insertCell();
         const amountCell = row.insertCell();
         const actionsCell = row.insertCell();

         dateCell.textContent = expense.date;
         providerCell.textContent = expense.provider;
         descriptionCell.textContent = expense.description;
         amountCell.textContent = expense.amount.toFixed(2);

         const deleteButton = document.createElement('button');
         deleteButton.textContent = 'Delete';
         deleteButton.onclick = () => deleteExpense(index);
         actionsCell.appendChild(deleteButton);

         total += expense.amount;
     });

     totalElement.textContent = `Total: R ${total.toFixed(2)}`;
 }

 function convertToPDF() {
     // Create a new table element for the PDF
     const pdfTable = document.createElement('table');
     pdfTable.style.width = '100%';
     pdfTable.style.borderCollapse = 'collapse';

     // Add the page heading
     const headingRow = pdfTable.insertRow();
     const headingCell = headingRow.insertCell();
     headingCell.colSpan = 4; // Span across all columns
     headingCell.style.textAlign = 'center';
     headingCell.style.fontWeight = 'bold';
     headingCell.style.fontSize = '18px';
     headingCell.style.padding = '10px';
     headingCell.textContent = 'Expense Tracker';

     // Add the table headers
     const headerRow = pdfTable.insertRow();
     const headers = ['Date', 'Provider', 'Description', 'Amount'];
     headers.forEach(headerText => {
         const headerCell = document.createElement('th');
         headerCell.textContent = headerText;
         headerCell.style.border = '1px solid #000';
         headerCell.style.padding = '8px';
         headerCell.style.backgroundColor = '#45484d';
         headerCell.style.color = '#abb2bf';
         headerRow.appendChild(headerCell);
     });

     // Add the user-entered data rows
     expenses.forEach(expense => {
         const row = pdfTable.insertRow();
         Object.values(expense).forEach(value => {
             const cell = row.insertCell();
             cell.textContent = value;
             cell.style.border = '1px solid #000';
             cell.style.padding = '8px';
             cell.style.backgroundColor = '#33363b';
             cell.style.color = '#e0e0e0';
         });
     });

     // Add the total row
     const totalRow = pdfTable.insertRow();
     const totalCell = totalRow.insertCell();
     totalCell.colSpan = 3; // Span across the first 3 columns
     totalCell.textContent = 'Total';
     totalCell.style.border = '1px solid #000';
     totalCell.style.padding = '8px';
     totalCell.style.backgroundColor = '#45484d';
     totalCell.style.color = '#abb2bf';

     const totalAmountCell = totalRow.insertCell();
     totalAmountCell.textContent = `R ${calculateTotal().toFixed(2)}`;
     totalAmountCell.style.border = '1px solid #000';
     totalAmountCell.style.padding = '8px';
     totalAmountCell.style.backgroundColor = '#33363b';
     totalAmountCell.style.color = '#e0e0e0';

     // Create a temporary container to render the table for PDF
     const tempContainer = document.createElement('div');
     tempContainer.style.position = 'absolute';
     tempContainer.style.left = '-9999px'; // Move off-screen
     tempContainer.appendChild(pdfTable);
     document.body.appendChild(tempContainer);

     // Convert the table to PDF
     html2canvas(tempContainer, {
         scale: 2
     }).then(canvas => {
         const {
             jsPDF
         } = window.jspdf; // Access jsPDF correctly from UMD module
         const doc = new jsPDF('p', 'mm', 'a4');
         const imgData = canvas.toDataURL('image/png');
         const pageWidth = doc.internal.pageSize.getWidth();
         const pageHeight = doc.internal.pageSize.getHeight();
         const margin = 10; // 10mm margins
         const maxWidth = pageWidth - 2 * margin;
         const maxHeight = pageHeight - 2 * margin;


         // Calculate image dimensions to fit within the page
         const imgRatio = canvas.width / canvas.height;
         let imgWidth = maxWidth;
         let imgHeight = imgWidth / imgRatio;

         if (imgHeight > maxHeight) {
             imgHeight = maxHeight;
             imgWidth = imgHeight * imgRatio;
         }

         // Add image to PDF
         doc.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);


         // Save the PDF and show success alert
         doc.save('Medical Expenses Out Of Pocket BK Ward.pdf');
         alert('PDF saved to your downloads folder!');

         // Clean up the temporary container
         document.body.removeChild(tempContainer);
     }).catch(error => {
         alert('Error generating PDF: ' + error.message);
         document.body.removeChild(tempContainer); // Clean up on error
     });
 }

 function calculateTotal() {
     let total = 0;
     expenses.forEach(expense => {
         total += expense.amount;
     });
     return total;
 }