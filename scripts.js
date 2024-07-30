document.getElementById('logicForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const proposition = document.getElementById('proposition').value;
    const truthTableDiv = document.getElementById('truthTable');
    const equivalentPropositionsDiv = document.getElementById('equivalentPropositions');
    const tautologyCheckDiv = document.getElementById('tautologyCheck');
    const negationPropositionDiv = document.getElementById('negationProposition');

    // ฟังก์ชันเพื่อสร้างตารางค่าความจริง
    function generateTruthTable(proposition) {
        const variables = getVariables(proposition);
        const rows = generateTruthTableRows(variables);
        const table = `
            <table border="1">
                <tr>${variables.map(v => `<th>${v}</th>`).join('')}<th>${proposition}</th></tr>
                ${rows.map(row => `
                    <tr>${row.map(val => `<td>${val ? 'T' : 'F'}</td>`).join('')}<td>${evaluateExpression(proposition, row, variables) ? 'T' : 'F'}</td></tr>
                `).join('')}
            </table>
        `;
        return table;
    }

    // ฟังก์ชันเพื่อดึงตัวแปรที่ใช้ในประพจน์
    function getVariables(proposition) {
        const matches = proposition.match(/[pqrst]/g);
        return [...new Set(matches)];
    }

    // ฟังก์ชันเพื่อสร้างแถวของตารางค่าความจริง
    function generateTruthTableRows(variables) {
        const rows = [];
        const rowCount = Math.pow(2, variables.length);
        for (let i = 0; i < rowCount; i++) {
            const row = [];
            for (let j = 0; j < variables.length; j++) {
                row.push(!!(i & (1 << (variables.length - j - 1))));
            }
            rows.push(row);
        }
        return rows;
    }

    // ฟังก์ชันเพื่อประเมินค่าของตัวแปรตรรกศาสตร์
    function evaluateExpression(proposition, values, variables) {
        // แปลงตัวแปรเป็นค่าจริง
        let expr = proposition;
        variables.forEach((variable, index) => {
            expr = expr.replace(new RegExp(variable, 'g'), values[index]);
        });
        expr = expr
            .replace(/¬/g, '!')
            .replace(/∧/g, '&&')
            .replace(/∨/g, '||')
            .replace(/→/g, '<=')
            .replace(/↔/g, '===');

        try {
            // ประเมินนิพจน์และคืนค่าผลลัพธ์
            return eval(expr);
        } catch (error) {
            console.error('Error evaluating expression:', expr, error);
            return false;
        }
    }

    // ฟังก์ชันเพื่อตรวจสอบว่าเป็นสัจนิรันดร์หรือไม่
    function checkTautology(proposition) {
        const variables = getVariables(proposition);
        const rows = generateTruthTableRows(variables);
        const isTautology = rows.every(row => evaluateExpression(proposition, row, variables));
        return isTautology ? `<p>โจทย์ ${proposition} เป็นสัจนิรันดร์</p>` : `<p>โจทย์ ${proposition} ไม่เป็นสัจนิรันดร์</p>`;
    }

    // ฟังก์ชันเพื่อหาประพจน์ที่สมมูลกัน
    function findEquivalentPropositions(proposition) {
        const equivalents = {
            "¬¬p": "p",
            "p→q": "¬p∨q",
            "¬(p∧q)": "¬p∨¬q",
            "¬(p∨q)": "¬p∧¬q",
            "p∨q": "q∨p",
            "p∧q": "q∧p",
            "p∧(q∨r)": "(p∧q)∨(p∧r)",
            "p∨(q∧r)": "(p∨q)∧(p∨r)",
            "p↔q": "(p→q)∧(q→p)"
        };

        const normalizedProp = normalizeProposition(proposition);
        for (let key in equivalents) {
            if (normalizedProp === normalizeProposition(key)) {
                return `<p>ประพจน์ที่สมมูลกับ ${proposition} คือ ${equivalents[key]}</p>`;
            }
        }
        return `<p>ไม่พบประพจน์ที่สมมูลกับ ${proposition}</p>`;
    }

    // ฟังก์ชันเพื่อแปลงประพจน์ให้เป็นรูปแบบมาตรฐาน
    function normalizeProposition(proposition) {
        return proposition.replace(/\s+/g, '').toLowerCase().replace(/∨/g, 'v').replace(/∧/g, '∧').replace(/→/g, '→').replace(/↔/g, '↔').replace(/¬/g, '¬');
    }

    // ฟังก์ชันเพื่อหาประพจน์ที่เป็นนิเสธของโจทย์
    function getNegationProposition(proposition) {
        const negations = {
            "p∧q": "¬p∨¬q",
            "p∨q": "¬p∧¬q",
            "p→q": "p∧¬q",
            "p↔q": "(p∧¬q)∧(¬q∧p)"
        };

        const normalizedProp = normalizeProposition(proposition);
        if (negations.hasOwnProperty(normalizedProp)) {
            return negations[normalizedProp];
        } else {
            return `¬(${proposition})`;
        }
    }

    // เรียกใช้ฟังก์ชันเพื่อสร้างผลลัพธ์
    truthTableDiv.innerHTML = generateTruthTable(proposition);
    equivalentPropositionsDiv.innerHTML = findEquivalentPropositions(proposition);
    tautologyCheckDiv.innerHTML = checkTautology(proposition);
    negationPropositionDiv.innerHTML = `<p>ประพจน์ที่เป็นนิเสธของ ${proposition} คือ ${getNegationProposition(proposition)}</p>`;
});
