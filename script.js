
function calculateEMI() {
  let loan = parseFloat(document.getElementById("loan").value);
  let rate = parseFloat(document.getElementById("rate").value) / 12 / 100;
  let tenure = parseFloat(document.getElementById("tenure").value) * 12;

  if (!loan || !rate || !tenure) {
    document.getElementById("emi").textContent = "0.00";
    return;
  }

  let emi = (loan * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
  document.getElementById("emi").textContent = emi.toFixed(2);
}
