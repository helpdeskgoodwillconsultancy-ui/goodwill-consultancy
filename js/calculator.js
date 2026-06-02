document.addEventListener('DOMContentLoaded', () => {

    // Individual Regime Toggle
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

    // Dynamic Assets Storage
    let individualAssets = [];

    const assetRates = {
        computers: { label: 'Computers (40% Dep.)', rate: 0.40 },
        furniture: { label: 'Furniture (10% Dep.)', rate: 0.10 }
    };

    // Add Asset Button
    const btnAddIndiv = document.getElementById('btn-add-indiv-asset');
    if (btnAddIndiv) {
        btnAddIndiv.addEventListener('click', () => {
            const typeEl = document.getElementById('indiv-asset-type');
            const nameEl = document.getElementById('indiv-asset-name');
            const valEl = document.getElementById('indiv-asset-value');

            if (typeEl && valEl) {
                const val = parseFloat(valEl.value) || 0;
                if (val <= 0) return;

                const name = nameEl && nameEl.value.trim() ? nameEl.value.trim() : assetRates[typeEl.value].label.split(' ')[0];
                individualAssets.push({
                    type: typeEl.value,
                    name: name,
                    value: val
                });

                if (nameEl) nameEl.value = '';
                valEl.value = '';
                renderIndividualAssets();
                calculateIndividual();
            }
        });
    }

    function renderIndividualAssets() {
        const container = document.getElementById('indiv-asset-list-container');
        const list = document.getElementById('indiv-asset-list');
        const count = document.getElementById('indiv-asset-count');

        if (!container || !list || !count) return;

        if (individualAssets.length === 0) {
            container.style.display = 'none';
            list.innerHTML = '';
            count.innerText = '0 Assets';
            return;
        }

        container.style.display = 'block';
        count.innerText = `${individualAssets.length} Asset${individualAssets.length > 1 ? 's' : ''}`;
        list.innerHTML = individualAssets.map((asset, index) => {
            const depVal = asset.value * assetRates[asset.type].rate;
            return `
                <div class="asset-item">
                    <div class="asset-item-info">
                        <span class="asset-badge">${assetRates[asset.type].label}</span>
                        <strong>${asset.name}</strong>
                        <span style="color:var(--text-muted)">Value: ₹${asset.value.toLocaleString('en-IN')}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap: 15px;">
                        <span style="font-weight:600">Dep: ₹${Math.round(depVal).toLocaleString('en-IN')}</span>
                        <button type="button" class="btn-delete-asset" data-index="${index}"><i class="ph ph-trash" style="font-size: 1.1rem;"></i></button>
                    </div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.btn-delete-asset').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                individualAssets.splice(idx, 1);
                renderIndividualAssets();
                calculateIndividual();
            });
        });
    }

    // Input Listeners
    const indivInputs = ['indiv-income', 'indiv-age', 'indiv-deductions'];
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

        let totalDepreciation = 0;
        individualAssets.forEach(asset => {
            totalDepreciation += asset.value * assetRates[asset.type].rate;
        });

        let standardDeduction = currentRegime === 'new' ? 75000 : 50000;

        let taxable = gross - deductions - standardDeduction - totalDepreciation;
        if (taxable < 0) taxable = 0;

        let baseTax = 0;

        if (currentRegime === 'new') {
            // FY 2025-26 New Regime Slabs
            if (taxable > 2400000) baseTax = (taxable - 2400000) * 0.30 + 300000;
            else if (taxable > 2000000) baseTax = (taxable - 2000000) * 0.25 + 200000;
            else if (taxable > 1600000) baseTax = (taxable - 1600000) * 0.20 + 120000;
            else if (taxable > 1200000) baseTax = (taxable - 1200000) * 0.15 + 80000;
            else if (taxable > 800000) baseTax = (taxable - 800000) * 0.10 + 20000;
            else if (taxable > 400000) baseTax = (taxable - 400000) * 0.05;

            // Rebate u/s 87A - zero tax up to ₹12 lakh
            if (taxable <= 1200000) baseTax = 0;

        } else {
            // Old Regime
            let exemption = 250000;
            if (age === '60-80') exemption = 300000;
            if (age === '80+') exemption = 500000;

            if (taxable > 1000000) {
                baseTax = (taxable - 1000000) * 0.30 + 112500;
            } else if (taxable > 500000) {
                baseTax = (taxable - 500000) * 0.20 + 12500;
            } else if (taxable > exemption) {
                baseTax = (taxable - exemption) * 0.05;
            }

            if (taxable <= 500000) {
                baseTax = Math.max(0, baseTax - 12500);
            }
        }

        let surcharge = 0;
        if (taxable > 20000000) surcharge = baseTax * 0.25;
        else if (taxable > 10000000) surcharge = baseTax * 0.15;
        else if (taxable > 5000000) surcharge = baseTax * 0.10;

        const cess = (baseTax + surcharge) * 0.04;
        const totalTax = baseTax + surcharge + cess;
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
                <div class="breakdown-row"><span>Gross Base Tax</span> <span>₹${Math.round(baseTax).toLocaleString('en-IN')}</span></div>
                <div class="breakdown-row"><span>Standard Deduction (u/s 16)</span> <span>- ₹${standardDeduction.toLocaleString('en-IN')}</span></div>
                ${totalDepreciation > 0 ? `<div class="breakdown-row"><span>Asset Depreciation Deduction</span> <span style="color:#2e7d32">- ₹${Math.round(totalDepreciation).toLocaleString('en-IN')}</span></div>` : ''}
                <div class="breakdown-row"><span>Surcharge</span> <span>₹${Math.round(surcharge).toLocaleString('en-IN')}</span></div>
                <div class="breakdown-row"><span>Health & Education Cess (4%)</span> <span>₹${Math.round(cess).toLocaleString('en-IN')}</span></div>
            `;
        }
    }

    calculateIndividual();
});