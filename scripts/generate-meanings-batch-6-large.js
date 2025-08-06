// 効率的な意味定義生成 - Batch 6 (大型バッチ: 50語)
// Node.js + better-sqlite3を使用

const Database = require('better-sqlite3');
const path = require('path');

// データベース接続
const dbPath = path.join(process.cwd(), 'data', 'noun_gender.db');
const db = new Database(dbPath);

// 単語とその意味定義のマッピング (50語)
const meanings = [
  {
    english: 'baggage',
    meaning_en: 'suitcases and bags used for travel',
    meaning_ja: '旅行に使用するスーツケースやバッグ',
    meaning_zh: '旅行用的手提箱和包'
  },
  {
    english: 'bail',
    meaning_en: 'money paid to release arrested person',
    meaning_ja: '逮捕された人を釈放するために支払う金銭',
    meaning_zh: '为释放被捕人员而支付的金钱'
  },
  {
    english: 'bailout',
    meaning_en: 'financial rescue of failing organization',
    meaning_ja: '破綻した組織の財政救済',
    meaning_zh: '对濒临倒闭组织的财政救助'
  },
  {
    english: 'baker',
    meaning_en: 'person who bakes bread and cakes',
    meaning_ja: 'パンやケーキを焼く人',
    meaning_zh: '烘烤面包和蛋糕的人'
  },
  {
    english: 'balance',
    meaning_en: 'even distribution of weight; remaining amount',
    meaning_ja: '重量の均等な分配；残高',
    meaning_zh: '重量的均匀分布；余额'
  },
  {
    english: 'ball',
    meaning_en: 'round object used in games; formal dance',
    meaning_ja: 'ゲームで使用する丸い物体；正式な舞踏会',
    meaning_zh: '游戏中使用的圆形物体；正式舞会'
  },
  {
    english: 'ballad',
    meaning_en: 'narrative poem or song telling story',
    meaning_ja: '物語を語る叙事詩や歌',
    meaning_zh: '讲述故事的叙事诗或歌曲'
  },
  {
    english: 'ballet',
    meaning_en: 'artistic dance form with precise movements',
    meaning_ja: '精密な動きを持つ芸術的な舞踊形式',
    meaning_zh: '具有精确动作的艺术舞蹈形式'
  },
  {
    english: 'ballot',
    meaning_en: 'process or paper used for voting',
    meaning_ja: '投票に使用される過程や用紙',
    meaning_zh: '用于投票的过程或纸张'
  },
  {
    english: 'bamboo',
    meaning_en: 'tall woody grass plant',
    meaning_ja: '背の高い木質の草本植物',
    meaning_zh: '高大的木质草本植物'
  },
  {
    english: 'banana',
    meaning_en: 'yellow curved tropical fruit',
    meaning_ja: '黄色い曲がった熱帯の果実',
    meaning_zh: '黄色弯曲的热带水果'
  },
  {
    english: 'band',
    meaning_en: 'group of musicians; strip of material',
    meaning_ja: '音楽家のグループ；材料の帯',
    meaning_zh: '音乐家团体；材料条带'
  },
  {
    english: 'bandage',
    meaning_en: 'strip of material for covering wounds',
    meaning_ja: '傷を覆うための材料の帯',
    meaning_zh: '用于包扎伤口的材料条'
  },
  {
    english: 'bang',
    meaning_en: 'sudden loud noise; hair cut straight across',
    meaning_ja: '突然の大きな音；真っ直ぐ切った前髪',
    meaning_zh: '突然的巨大噪音；齐刘海'
  },
  {
    english: 'bank',
    meaning_en: 'financial institution; side of river',
    meaning_ja: '金融機関；川岸',
    meaning_zh: '金融机构；河岸'
  },
  {
    english: 'banker',
    meaning_en: 'person who works in banking',
    meaning_ja: '銀行業務に従事する人',
    meaning_zh: '从事银行业务的人'
  },
  {
    english: 'banking',
    meaning_en: 'business of operating banks',
    meaning_ja: '銀行を運営する事業',
    meaning_zh: '经营银行的业务'
  },
  {
    english: 'bankruptcy',
    meaning_en: 'legal state of being unable to pay debts',
    meaning_ja: '債務を支払えない法的状態',
    meaning_zh: '无法偿还债务的法律状态'
  },
  {
    english: 'baptism',
    meaning_en: 'Christian ceremony of initiation',
    meaning_ja: 'キリスト教の入信式',
    meaning_zh: '基督教的洗礼仪式'
  },
  {
    english: 'bar',
    meaning_en: 'place serving alcoholic drinks; rod or barrier',
    meaning_ja: 'アルコール飲料を提供する場所；棒や障壁',
    meaning_zh: '供应酒精饮料的场所；杆或屏障'
  },
  {
    english: 'barbarism',
    meaning_en: 'extreme cruelty or brutality',
    meaning_ja: '極度の残酷さや野蛮さ',
    meaning_zh: '极度的残酷或野蛮'
  },
  {
    english: 'barbecue',
    meaning_en: 'outdoor cooking method; social gathering',
    meaning_ja: '屋外の調理方法；社交的な集まり',
    meaning_zh: '户外烹饪方法；社交聚会'
  },
  {
    english: 'barber',
    meaning_en: 'person who cuts hair, especially men\'s',
    meaning_ja: '髪を切る人、特に男性の',
    meaning_zh: '剪发的人，特别是男士的'
  },
  {
    english: 'bargain',
    meaning_en: 'agreement; something sold at low price',
    meaning_ja: '協定；安い価格で売られるもの',
    meaning_zh: '协议；以低价出售的东西'
  },
  {
    english: 'bark',
    meaning_en: 'outer covering of tree; dog\'s sound',
    meaning_ja: '木の外皮；犬の鳴き声',
    meaning_zh: '树的外皮；狗的叫声'
  },
  {
    english: 'barley',
    meaning_en: 'cereal grain used for food and brewing',
    meaning_ja: '食用や醸造に使用される穀物',
    meaning_zh: '用于食品和酿造的谷物'
  },
  {
    english: 'barn',
    meaning_en: 'large farm building for storing crops',
    meaning_ja: '作物を貯蔵する大きな農場の建物',
    meaning_zh: '用于储存作物的大型农场建筑'
  },
  {
    english: 'baroque',
    meaning_en: 'elaborate artistic style from 17th-18th centuries',
    meaning_ja: '17-18世紀の精巧な芸術様式',
    meaning_zh: '17-18世纪的精美艺术风格'
  },
  {
    english: 'barracks',
    meaning_en: 'building housing soldiers',
    meaning_ja: '兵士が住む建物',
    meaning_zh: '士兵居住的建筑物'
  },
  {
    english: 'barrel',
    meaning_en: 'large round container; tube of gun',
    meaning_ja: '大きな円形の容器；銃の筒',
    meaning_zh: '大型圆形容器；枪管'
  },
  {
    english: 'barrier',
    meaning_en: 'obstacle preventing movement or access',
    meaning_ja: '移動やアクセスを妨げる障害物',
    meaning_zh: '阻止移动或进入的障碍物'
  },
  {
    english: 'base',
    meaning_en: 'lowest part; foundation; military installation',
    meaning_ja: '最下部；基礎；軍事施設',
    meaning_zh: '最底部；基础；军事设施'
  },
  {
    english: 'baseball',
    meaning_en: 'sport played with bat and ball',
    meaning_ja: 'バットとボールで行うスポーツ',
    meaning_zh: '用球棒和球进行的运动'
  },
  {
    english: 'basic',
    meaning_en: 'fundamental; forming essential foundation',
    meaning_ja: '基本的な；不可欠な基礎を形成する',
    meaning_zh: '基本的；形成基础的'
  },
  {
    english: 'basis',
    meaning_en: 'underlying foundation or principle',
    meaning_ja: '基礎となる土台や原理',
    meaning_zh: '基础的根据或原则'
  },
  {
    english: 'basket',
    meaning_en: 'container made of woven material',
    meaning_ja: '編まれた材料で作られた容器',
    meaning_zh: '用编织材料制成的容器'
  },
  {
    english: 'basketball',
    meaning_en: 'sport with ball and elevated hoops',
    meaning_ja: 'ボールと高いフープで行うスポーツ',
    meaning_zh: '用球和高架篮筐进行的运动'
  },
  {
    english: 'bass',
    meaning_en: 'low-pitched musical range; type of fish',
    meaning_ja: '低音域；魚の一種',
    meaning_zh: '低音范围；一种鱼类'
  },
  {
    english: 'bat',
    meaning_en: 'flying mammal; equipment for hitting ball',
    meaning_ja: '飛ぶ哺乳動物；ボールを打つ道具',
    meaning_zh: '飞行的哺乳动物；击球用具'
  },
  {
    english: 'bath',
    meaning_en: 'act of washing body; container for bathing',
    meaning_ja: '体を洗う行為；入浴用の容器',
    meaning_zh: '洗身体的行为；洗澡用容器'
  },
  {
    english: 'bathe',
    meaning_en: 'wash oneself or someone else',
    meaning_ja: '自分自身や他人を洗う',
    meaning_zh: '清洗自己或他人'
  },
  {
    english: 'bathroom',
    meaning_en: 'room containing toilet and washing facilities',
    meaning_ja: 'トイレと洗面設備がある部屋',
    meaning_zh: '有厕所和洗漱设施的房间'
  },
  {
    english: 'battalion',
    meaning_en: 'large military unit of soldiers',
    meaning_ja: '兵士の大きな軍事単位',
    meaning_zh: '士兵的大型军事单位'
  },
  {
    english: 'battery',
    meaning_en: 'device storing electrical energy; violent attack',
    meaning_ja: '電気エネルギーを蓄える装置；暴力的な攻撃',
    meaning_zh: '储存电能的装置；暴力攻击'
  },
  {
    english: 'battle',
    meaning_en: 'fight between armies; struggle',
    meaning_ja: '軍隊間の戦闘；闘争',
    meaning_zh: '军队之间的战斗；斗争'
  },
  {
    english: 'battlefield',
    meaning_en: 'area where battle takes place',
    meaning_ja: '戦闘が行われる地域',
    meaning_zh: '战斗发生的区域'
  },
  {
    english: 'battleship',
    meaning_en: 'large heavily armed warship',
    meaning_ja: '大型の重武装軍艦',
    meaning_zh: '大型重武装战舰'
  },
  {
    english: 'bay',
    meaning_en: 'body of water partly enclosed by land',
    meaning_ja: '陸地に部分的に囲まれた水域',
    meaning_zh: '被陆地部分包围的水域'
  },
  {
    english: 'beach',
    meaning_en: 'sandy or rocky shore by ocean',
    meaning_ja: '海に面した砂浜や岩の海岸',
    meaning_zh: '海边的沙滩或岩石海岸'
  },
  {
    english: 'bean',
    meaning_en: 'edible seed of leguminous plant',
    meaning_ja: 'マメ科植物の食用種子',
    meaning_zh: '豆科植物的可食用种子'
  }
];

// 言語テーブル一覧
const languageTables = ['words_fr', 'words_de', 'words_es', 'words_it', 'words_ru', 'words_ar', 'words_hi'];

try {
  // トランザクション開始
  db.exec('BEGIN TRANSACTION');
  
  let totalUpdated = 0;
  
  meanings.forEach(meaning => {
    languageTables.forEach(table => {
      try {
        const stmt = db.prepare(`
          UPDATE ${table} 
          SET 
            meaning_en = ?,
            meaning_ja = ?,
            meaning_zh = ?,
            stage_2_meanings = 1,
            verified_at = datetime('now')
          WHERE english = ?
        `);
        
        const result = stmt.run(
          meaning.meaning_en,
          meaning.meaning_ja, 
          meaning.meaning_zh,
          meaning.english
        );
        
        if (result.changes > 0) {
          totalUpdated++;
          console.log(`✓ ${table}: ${meaning.english}`);
        }
      } catch (error) {
        console.error(`Error updating ${table}.${meaning.english}:`, error.message);
      }
    });
  });
  
  // トランザクション確定
  db.exec('COMMIT');
  
  console.log(`\n🎉 Successfully updated ${totalUpdated} records across all language tables`);
  console.log(`📊 Processed ${meanings.length} words across ${languageTables.length} languages`);
  console.log(`📈 Progress: ${138 + meanings.length} / 4,541 words completed (${((138 + meanings.length) / 4541 * 100).toFixed(1)}%)`);
  
} catch (error) {
  // エラー時はロールバック
  db.exec('ROLLBACK');
  console.error('Transaction failed:', error.message);
} finally {
  db.close();
}