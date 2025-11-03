// 易经六十四卦数据
const hexagrams = {
    1: { name: "乾为天", interpretation: "大吉大利，象征天，具有创造、刚健、进取的特性。" },
    2: { name: "坤为地", interpretation: "柔顺包容，象征地，具有顺从、承载、滋养的特性。" },
    3: { name: "水雷屯", interpretation: "初始艰难，象征事物初生时的困难与挑战。" },
    4: { name: "山水蒙", interpretation: "启蒙教育，象征需要教导和学习的阶段。" },
    5: { name: "水天需", interpretation: "等待时机，象征需要耐心等待合适时机的到来。" },
    6: { name: "天水讼", interpretation: "争议诉讼，象征可能面临争执和冲突的局面。" },
    7: { name: "地水师", interpretation: "统率众人，象征需要领导和组织能力的情况。" },
    8: { name: "水地比", interpretation: "亲附合作，象征和谐相处和团队合作的重要性。" },
    9: { name: "风天小畜", interpretation: "小有积蓄，象征积累和准备阶段。" },
    10: { name: "天泽履", interpretation: "谨慎行事，象征需要小心谨慎地前进。" },
    11: { name: "地天泰", interpretation: "通达顺利，象征阴阳调和、万事亨通的局面。" },
    12: { name: "天地否", interpretation: "闭塞不通，象征困难和不顺利的时期。" },
    13: { name: "天火同人", interpretation: "与人协同，象征合作与团结的力量。" },
    14: { name: "火天大有", interpretation: "丰收大有，象征收获丰富和事业成功。" },
    15: { name: "地山谦", interpretation: "谦虚谨慎，象征谦逊美德带来的好处。" },
    16: { name: "雷地豫", interpretation: "愉悦安乐，象征欢乐和顺遂的时期。" },
    17: { name: "泽雷随", interpretation: "随从顺应，象征适应环境和跟随趋势。" },
    18: { name: "山风蛊", interpretation: "整治弊病，象征需要纠正错误和解决问题。" },
    19: { name: "地泽临", interpretation: "亲临监督，象征亲自参与和管理的重要性。" },
    20: { name: "风地观", interpretation: "观察审视，象征需要仔细观察和思考。" },
    21: { name: "火雷噬嗑", interpretation: "咬合破除，象征需要果断行动破除障碍。" },
    22: { name: "山火贲", interpretation: "装饰美化，象征需要注重外表和仪式。" },
    23: { name: "山地剥", interpretation: "剥落衰落，象征事物衰退和需要警惕。" },
    24: { name: "地雷复", interpretation: "回复复兴，象征事物恢复和重新开始。" },
    25: { name: "天雷无妄", interpretation: "无妄之灾，象征意外和需要谨慎。" },
    26: { name: "山天大畜", interpretation: "大有积蓄，象征大量积累和准备。" },
    27: { name: "山雷颐", interpretation: "颐养天年，象征养生和自给自足。" },
    28: { name: "泽风大过", interpretation: "过度冒险，象征过度和需要平衡。" },
    29: { name: "坎为水", interpretation: "重重险阻，象征困难和危险。" },
    30: { name: "离为火", interpretation: "光明依附，象征光明和依附。" },
    31: { name: "泽山咸", interpretation: "感应相通，象征感应和互动。" },
    32: { name: "雷风恒", interpretation: "恒久不变，象征持久和稳定。" },
    33: { name: "天山遁", interpretation: "退避隐遁，象征退避和隐忍。" },
    34: { name: "雷天大壮", interpretation: "强盛壮大，象征强盛和进取。" },
    35: { name: "火地晋", interpretation: "前进晋升，象征进步和发展。" },
    36: { name: "地火明夷", interpretation: "光明受伤，象征困难和需要忍耐。" },
    37: { name: "风火家人", interpretation: "家庭和谐，象征家庭和内部关系。" },
    38: { name: "火泽睽", interpretation: "睽违背离，象征分歧和对立。" },
    39: { name: "水山蹇", interpretation: "艰难险阻，象征困难和阻碍。" },
    40: { name: "雷水解", interpretation: "解除困难，象征解脱和解决。" },
    41: { name: "山泽损", interpretation: "减损损失，象征损失和减损。" },
    42: { name: "风雷益", interpretation: "增益有利，象征收益和增长。" },
    43: { name: "泽天夬", interpretation: "决断果敢，象征决断和果断。" },
    44: { name: "天风姤", interpretation: "相遇邂逅，象征相遇和机缘。" },
    45: { name: "泽地萃", interpretation: "荟萃聚集，象征聚集和集合。" },
    46: { name: "地风升", interpretation: "上升发展，象征上升和进步。" },
    47: { name: "泽水困", interpretation: "困顿艰难，象征困境和限制。" },
    48: { name: "水风井", interpretation: "水井养人，象征资源和修养。" },
    49: { name: "泽火革", interpretation: "变革革新，象征变革和更新。" },
    50: { name: "火风鼎", interpretation: "鼎立稳固，象征稳固和建立。" },
    51: { name: "震为雷", interpretation: "震动惊醒，象征震动和行动。" },
    52: { name: "艮为山", interpretation: "静止停止，象征静止和等待。" },
    53: { name: "风山渐", interpretation: "渐进发展，象征渐进和缓慢进步。" },
    54: { name: "雷泽归妹", interpretation: "少女出嫁，象征结合和归宿。" },
    55: { name: "雷火丰", interpretation: "丰盛盛大，象征丰盛和繁荣。" },
    56: { name: "火山旅", interpretation: "旅行在外，象征旅行和不安定。" },
    57: { name: "巽为风", interpretation: "顺从进入，象征顺从和渗透。" },
    58: { name: "兑为泽", interpretation: "喜悦交流，象征喜悦和沟通。" },
    59: { name: "风水涣", interpretation: "涣散解散，象征涣散和分散。" },
    60: { name: "水泽节", interpretation: "节制节约，象征节制和约束。" },
    61: { name: "风泽中孚", interpretation: "诚信信心，象征诚信和信任。" },
    62: { name: "雷山小过", interpretation: "小有过失，象征小错和谨慎。" },
    63: { name: "水火既济", interpretation: "事已完成，象征成功和完成。" },
    64: { name: "火水未济", interpretation: "事未完成，象征未完成和继续努力。" }
};

// 爻的数值对应关系
const lineValues = {
    6: { type: "阴", changing: true, symbol: "▅▅　▅▅" },
    7: { type: "阳", changing: false, symbol: "▅▅▅▅▅" },
    8: { type: "阴", changing: false, symbol: "▅▅　▅▅" },
    9: { type: "阳", changing: true, symbol: "▅▅▅▅▅" }
};

// 根据六爻计算卦象编号的简化函数
function calculateHexagramId(lines) {
    // 从下到上（lines[0]是初爻，lines[5]是上爻）
    // 阳爻为1，阴爻为0
    let binary = '';
    for (let i = 5; i >= 0; i--) {
        binary += (lines[i] === 7 || lines[i] === 9) ? '1' : '0';
    }
    
    // 转换为十进制，范围1-64
    const id = parseInt(binary, 2) + 1;
    
    // 确保在有效范围内
    return Math.max(1, Math.min(64, id));
}