document.addEventListener('DOMContentLoaded', () => {
    // Tabs
    const tabIndiv = document.getElementById('tab-individual');
    const tabBiz = document.getElementById('tab-business');
    const secIndiv = document.getElementById('sec-individual');
    const secBiz = document.getElementById('sec-business');

    if (tabIndiv && tabBiz && secIndiv && secBiz) {
        tabIndiv.addEventListener('click', () => {
            tabIndiv.classList.add('active');
            tabBiz.classList.remove('active');
            secIndiv.classList.add('active');
            secBiz.classList.remove('active');
        });

        tabBiz.addEventListener('click', () => {
            tabBiz.classList.add('active');
            tabIndiv.classList.remove('active');
            secBiz.classList.add('active');
            secIndiv.classList.remove('active');
        });
    }

    // Individual Logic
    const regimeNew = document.getElementById('regime-new');
    const regimeOld = document.getElementById('regime-old');
    let currentRegime = 'new';

    if (regimeNew && regimeOld) {
        regimeNew.addEventListener('click', () => {
            currentRegime = 'new';
            regimeNew.classList.add('active');
            regimeOld.classList.remove('active');
            const wrapper = document.getElementById('deductions-wrapper');
            if (wrapper) wrapper.style.opacity = '0.5';
            const dedInput = document.getElementById('indiv-deductions');
            if (dedInput) dedInput.disabled = true;
            calculateIndividual();
        });

        regimeOld.addEventListener('click', () => {
            currentRegime = 'old';
            regimeOld.classList.add('active');
            regimeNew.classList.remove('active');
            const wrapper = document.getElementById('deductions-wrapper');
            if (wrapper) wrapper.style.opacity = '1';
            const dedInput = document.getElementById('indiv-deductions');
            if (dedInput) dedInput.disabled = false;
            calculateIndividual();
        });
    }

    const indivInputs = ['indiv-income', 'indiv-age', 'indiv-deductions', 'indiv-computers', 'indiv-computers-value', 'indiv-machinery', 'indiv-machinery-value', 'indiv-furniture', 'indiv-furniture-value'];
    indivInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', calculateIndividual);
            el.addEventListener('change', calculateIndividual);
        }
    });

    function calculateIndividual() {
        const grossInput = document.getElementById('indiv-income');
        if (!grossInput) return;

        const gross = parseFloat(grossInput.value) || 0;
        const ageEl = document.getElementById('indiv-age');
        const age = ageEl ? ageEl.value : '<60';

        const dedEl = document.getElementById('indiv-deductions');
        const deductions = currentRegime === 'old' ? (parseFloat(dedEl ? dedEl.value : 0) || 0) : 0;

        // Multiple asset depreciation
        let depreciation = 0;
        const assetRates = { computers: 0.40, machinery: 0.15, furniture: 0.10 };
        ['computers', 'machinery', 'furniture'].forEach(type => {
            const checkbox = document.getElementById('indiv-' + type);
            const valueInput = document.getElementById('indiv-' + type + '-value');
            if (checkbox && checkbox.checked && valueInput) {
                const val = parseFloat(valueInput.value) || 0;
                depreciation += val * assetRates[type];
            }
        });

        let standardDeduction = currentRegime === 'new' ? 75000 : 50000;

        let taxable = gross - deductions - standardDeduction - depreciation;
        if (taxable < 0) taxable = 0;

        let tax = 0;

        if (currentRegime === 'new') {
            // FY 2025-26 New Regime Slabs
            if (taxable > 2400000) tax = (taxable - 2400000) * 0.30 + 300000;
            else if (taxable > 2000000) tax = (taxable - 2000000) * 0.25 + 200000;
            else if (taxable > 1600000) tax = (taxable - 1600000) * 0.20 + 120000;
            else if (taxable > 1200000) tax = (taxable - 1200000) * 0.15 + 80000;
            else if (taxable > 800000) tax = (taxable - 800000) * 0.10 + 20000;
            else if (taxable > 400000) tax = (taxable - 400000) * 0.05;

            // Rebate u/s 87A - zero tax up to ₹12 lakh
            if (taxable <= 1200000) {
                tax = 0;
            }
        } else {
            // Old Regime
            let exemption = 250000;
            if (age === '60-80') exemption = 300000;
            if (age === '80+') exemption = 500000;

            if (taxable > 1000000) {
                tax += (taxable - 1000000) * 0.30;
                tax += (1000000 - 500000) * 0.20;
                tax += (500000 - exemption) * 0.05;
            } else if (taxable > 500000) {
                tax += (taxable - 500000) * 0.20;
                tax += (500000 - exemption) * 0.05;
            } else if (taxable > exemption) {
                tax += (taxable - exemption) * 0.05;
            }

            if (taxable <= 500000) {
                tax = Math.max(0, tax - 12500);
            }
        }

        let surcharge = 0;
        if (taxable > 20000000) surcharge = tax * 0.25;
        else if (taxable > 10000000) surcharge = tax * 0.15;
        else if (taxable > 5000000) surcharge = tax * 0.10;

        const cess = (tax + surcharge) * 0.04;
        const totalTax = tax + surcharge + cess;
        const effectiveRate = gross > 0 ? ((totalTax / gross) * 100).toFixed(2) : 0;

        const resTaxable = document.getElementById('res-indiv-taxable');
        if (resTaxable) resTaxable.innerText = '₹' + Math.round(taxable).toLocaleString('en-IN');

        const resTax = document.getElementById('res-indiv-tax');
        if (resTax) resTax.innerText = '₹' + Math.round(totalTax).toLocaleString('en-IN');

        const resRate = document.getElementById('res-indiv-rate');
        if (resRate) resRate.innerText = effectiveRate + '%';

        const breakdown = document.getElementById('indiv-breakdown');
        if (breakdown) {
            breakdown.innerHTML = `
                <div class="breakdown-row"><span>Base Tax</span> <span>₹${Math.round(tax).toLocaleString('en-IN')}</span></div>
                <div class="breakdown-row"><span>Asset Depreciation Deduction</span> <span>- ₹${Math.round(depreciation).toLocaleString('en-IN')}</span></div>
                <div class="breakdown-row"><span>Surcharge</span> <span>₹${Math.round(surcharge).toLocaleString('en-IN')}</span></div>
                <div class="breakdown-row"><span>Cess (4%)</span> <span>₹${Math.round(cess).toLocaleString('en-IN')}</span></div>
            `;
        }
    }

    // Business Logic
    const bizInputs = ['biz-profit', 'biz-type', 'biz-turnover', 'biz-computers', 'biz-computers-value', 'biz-machinery', 'biz-machinery-value', 'biz-furniture', 'biz-furniture-value'];
    bizInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', calculateBusiness);
            el.addEventListener('change', calculateBusiness);
        }
    });

    function calculateBusiness() {
        const profitInput = document.getElementById('biz-profit');
        if (!profitInput) return;

        const profit = parseFloat(profitInput.value) || 0;
        const typeEl = document.getElementById('biz-type');
        const bizType = typeEl ? typeEl.value : 'pvt';
        const turnoverEl = document.getElementById('biz-turnover');
        const turnover = parseFloat(turnoverEl ? turnoverEl.value : 0) || 0;

        // Multiple asset depreciation
        let depreciation = 0;
        const assetRates = { computers: 0.40, machinery: 0.15, furniture: 0.10 };
        ['computers', 'machinery', 'furniture'].forEach(type => {
            const checkbox = document.getElementById('biz-' + type);
            const valueInput = document.getElementById('biz-' + type + '-value');
            if (checkbox && checkbox.checked && valueInput) {
                const val = parseFloat(valueInput.value) || 0;
                depreciation += val * assetRates[type];
            }
        });

        const taxableProfit = Math.max(0, profit - depreciation);

        let tax = 0;
        let surcharge = 0;
        let showMat = false;

        if (bizType === 'proprietorship') {
            if (taxableProfit > 1000000) tax = (taxableProfit - 1000000) * 0.30 + 112500;
            else if (taxableProfit > 500000) tax = (taxableProfit - 500000) * 0.20 + 12500;
            else if (taxableProfit > 250000) tax = (taxableProfit - 250000) * 0.05;

            if (taxableProfit > 20000000) surcharge = tax * 0.25;
            else if (taxableProfit > 10000000) surcharge = tax * 0.15;
            else if (taxableProfit > 5000000) surcharge = tax * 0.10;
        } else if (bizType === 'llp') {
            tax = taxableProfit * 0.30;
            if (taxableProfit > 10000000) surcharge = tax * 0.12;
            showMat = true;
        } else {
            let rate = (turnover <= 400000000) ? 0.25 : 0.30;
            tax = taxableProfit * rate;
            if (taxableProfit > 100000000) surcharge = tax * 0.12;
            else if (taxableProfit > 10000000) surcharge = tax * 0.07;
            showMat = true;
        }

        const cess = (tax + surcharge) * 0.04;
        const totalTax = tax + surcharge + cess;
        const effectiveRate = profit > 0 ? ((totalTax / profit) * 100).toFixed(2) : 0;

        const resTaxable = document.getElementById('res-biz-taxable');
        if (resTaxable) resTaxable.innerText = '₹' + Math.round(taxableProfit).toLocaleString('en-IN');

        const resTax = document.getElementById('res-biz-tax');
        if (resTax) resTax.innerText = '₹' + Math.round(totalTax).toLocaleString('en-IN');

        const resRate = document.getElementById('res-biz-rate');
        if (resRate) resRate.innerText = effectiveRate + '%';

        const breakdown = document.getElementById('biz-breakdown');
        if (breakdown) {
            let breakdownHTML = `
                <div class="breakdown-row"><span>Base Tax</span> <span>₹${Math.round(tax).toLocaleString('en-IN')}</span></div>
                <div class="breakdown-row"><span>Asset Depreciation Deduction</span> <span>- ₹${Math.round(depreciation).toLocaleString('en-IN')}</span></div>
                <div class="breakdown-row"><span>Surcharge</span> <span>₹${Math.round(surcharge).toLocaleString('en-IN')}</span></div>
                <div class="breakdown-row"><span>Cess (4%)</span> <span>₹${Math.round(cess).toLocaleString('en-IN')}</span></div>
            `;
            if (showMat && taxableProfit > 0) {
                const mat = taxableProfit * 0.15;
                breakdownHTML += `<div class="breakdown-row mt-1" style="color:var(--text-muted); font-size:0.85rem"><span>Note: MAT @ 15% would be</span> <span>₹${Math.round(mat).toLocaleString('en-IN')}</span></div>`;
            }
            breakdown.innerHTML = breakdownHTML;
        }
    }

    calculateIndividual();
    calculateBusiness();
});
