// js/hexagrams.js - 修复卦象计算

// 易经六十四卦数据
const hexagrams = {
    1: { name: "乾为天", interpretation: "元亨，利贞。象征天，具有创造、刚健、进取的特性。" },
    2: { name: "坤为地", interpretation: "元亨，利牝马之贞。象征地，具有顺从、承载、滋养的特性。" },
    3: { name: "水雷屯", interpretation: "元亨，利贞。勿用有攸往，利建侯。象征事物初生时的困难与挑战。" },
    4: { name: "山水蒙", interpretation: "亨。匪我求童蒙，童蒙求我。象征启蒙教育，需要教导和学习。" },
    5: { name: "水天需", interpretation: "有孚，光亨，贞吉，利涉大川。象征等待时机。" },
    6: { name: "天水讼", interpretation: "有孚，窒惕，中吉，终凶。象征争议诉讼。" },
    7: { name: "地水师", interpretation: "贞，丈人吉，无咎。象征统率众人。" },
    8: { name: "水地比", interpretation: "吉。原筮，元永贞，无咎。象征亲附合作。" },
    9: { name: "风天小畜", interpretation: "亨。密云不雨，自我西郊。象征小有积蓄。" },
    10: { name: "天泽履", interpretation: "履虎尾，不咥人，亨。象征谨慎行事。" },
    11: { name: "地天泰", interpretation: "小往大来，吉亨。象征通达顺利。" },
    12: { name: "天地否", interpretation: "否之匪人，不利君子贞，大往小来。象征闭塞不通。" },
    13: { name: "天火同人", interpretation: "同人于野，亨。利涉大川，利君子贞。象征与人协同。" },
    14: { name: "火天大有", interpretation: "元亨。象征丰收大有。" },
    15: { name: "地山谦", interpretation: "亨，君子有终。象征谦虚谨慎。" },
    16: { name: "雷地豫", interpretation: "利建侯行师。象征愉悦安乐。" },
    34: { name: "雷天大壮", interpretation: "利贞。象征强盛壮大。" },
    51: { name: "震为雷", interpretation: "亨。震来虩虩，笑言哑哑。象征震动惊醒。" },
    52: { name: "艮为山", interpretation: "艮其背，不获其身，行其庭，不见其人，无咎。象征静止停止。" },
    62: { name: "雷山小过", interpretation: "亨，利贞。可小事，不可大事。象征小有过失。" },
    63: { name: "水火既济", interpretation: "亨小，利贞。初吉终乱。象征事已完成。" },
    64: { name: "火水未济", interpretation: "亨。小狐汔济，濡其尾，无攸利。象征事未完成。" }
    // 这里只列出部分卦象，您可以根据需要补充完整64卦
};

// 爻的数值对应关系
const lineValues = {
    6: { type: "阴", changing: true, symbol: "▅▅　▅▅" },
    7: { type: "阳", changing: false, symbol: "▅▅▅▅▅" },
    8: { type: "阴", changing: false, symbol: "▅▅　▅▅" },
    9: { type: "阳", changing: true, symbol: "▅▅▅▅▅" }
};

// 正确的卦象计算函数
function calculateHexagramId(lines) {
    console.log('计算卦象ID，输入爻线:', lines);
    
    // 从下到上（lines[0]是初爻，lines[5]是上爻）
    // 阳爻为1，阴爻为0
    let binaryString = '';
    for (let i = 0; i < 6; i++) {
        // 7和9是阳爻，6和8是阴爻
        const isYang = lines[i] === 7 || lines[i] === 9;
        binaryString = (isYang ? '1' : '0') + binaryString; // 从下往上构建
    }
    
    console.log('二进制表示:', binaryString);
    
    // 转换为十进制
    const decimalValue = parseInt(binaryString, 2);
    const hexagramId = decimalValue + 1; // 卦象编号从1开始
    
    console.log('计算得到的卦象ID:', hexagramId, '二进制:', binaryString, '十进制:', decimalValue);
    
    // 确保在有效范围内
    return Math.max(1, Math.min(64, hexagramId));
}
