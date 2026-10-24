// SAMPLE questions written for testing. NOT from a live API and NOT verified as CAPS-aligned.
const S=(id,subject,topic,grades,difficulty,q,options,answer,explain)=>({id,subject,topic,grades,difficulty,q,options,answer,explain,source:'sample'});
window.SAMPLE_QUESTIONS=[
S('m1','Mathematics','Algebra',[8,9,10],'easy','Solve: 2x + 6 = 14',['x = 3','x = 4','x = 5','x = 10'],1,'Subtract 6 from both sides: 2x = 8. Divide by 2: x = 4.'),
S('m2','Mathematics','Algebra',[9,10,11],'medium','Simplify (x + 3)(x - 3)',['x² - 9','x² + 9','x² - 6','x² + 6x - 9'],0,'This is a difference of two squares: (a+b)(a-b) = a² - b².'),
S('m3','Mathematics','Analytical Geometry',[10,11,12],'medium','What is the gradient of the line through (1; 2) and (3; 8)?',['2','3','4','6'],1,'Gradient = (y2 - y1) / (x2 - x1) = (8 - 2) / (3 - 1) = 3.'),
S('m4','Mathematics','Calculus',[11,12],'medium','What is the derivative of f(x) = x³?',['x²','3x²','3x','x⁴/4'],1,'Power rule: bring down the power and subtract 1 from it. 3 · x² = 3x².'),
S('m5','Mathematics','Geometry',[8,9],'easy','What do the angles of a triangle add up to?',['90°','180°','270°','360°'],1,'The interior angles of any triangle always add up to 180°.'),
S('m6','Mathematics','Exponents and Logs',[10,11,12],'medium','What is log₂(8)?',['2','3','4','8'],1,'2³ = 8, so the power you need is 3.'),
S('p1','Physical Sciences','Forces',[8,9,10],'easy','What is the SI unit of force?',['Joule','Newton','Watt','Pascal'],1,'Force is measured in newtons (N), named after Isaac Newton.'),
S('p2','Physical Sciences','Electricity',[9,10,11,12],'medium','A 12 V battery drives current through a 4 Ω resistor. What is the current?',['3 A','8 A','48 A','0.33 A'],0,'V = IR, so I = V ÷ R = 12 ÷ 4 = 3 A.'),
S('p3','Physical Sciences','Motion',[8,9,10],'easy','Which formula gives speed?',['distance × time','distance ÷ time','time ÷ distance','distance + time'],1,'Speed = distance ÷ time.'),
S('p4','Physical Sciences','Periodic Table',[9,10,11],'easy','Which of these is a noble gas?',['Oxygen','Nitrogen','Argon','Chlorine'],2,'Argon is in Group 18, the noble gases. They rarely react.'),
S('p5','Physical Sciences','Newton\'s Laws',[10,11,12],'medium','An object moves with no net force acting on it. What happens?',['It speeds up','It keeps a constant velocity','It stops at once','It turns around'],1,'Newton\'s first law: with zero net force, velocity stays constant.'),
S('l1','Life Sciences','Cells',[8,9,10],'easy','Which organelle releases energy for the cell?',['Nucleus','Mitochondrion','Ribosome','Vacuole'],1,'Mitochondria release energy from glucose during cellular respiration.'),
S('l2','Life Sciences','Genetics',[10,11,12],'easy','What does DNA stand for?',['Deoxyribonucleic acid','Dinitrogen acid','Diribose nucleic acid','Deoxyribose nitrate acid'],0,'DNA = deoxyribonucleic acid, the molecule that carries genetic information.'),
S('l3','Life Sciences','Plants',[8,9,10],'easy','Which process do plants use to make food?',['Respiration','Photosynthesis','Digestion','Transpiration'],1,'Photosynthesis uses light, water and carbon dioxide to make glucose.'),
S('l4','Life Sciences','Plants',[8,9,10,11],'medium','Which gas do plants take in for photosynthesis?',['Oxygen','Carbon dioxide','Nitrogen','Hydrogen'],1,'Carbon dioxide enters through the stomata and is turned into glucose.'),
S('l5','Life Sciences','Genetics',[11,12],'medium','In DNA, adenine pairs with which base?',['Guanine','Cytosine','Thymine','Uracil'],2,'A pairs with T, and C pairs with G. Uracil is found in RNA, not DNA.')
];
