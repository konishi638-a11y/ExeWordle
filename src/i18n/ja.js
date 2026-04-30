// 日本語テキスト一元管理ファイル
// UIに表示される日本語はすべてここで定義する

export const ja = {
  // ページタイトル（ブラウザタブ）
  pageTitle: 'Wordleの電脳',

  // ゲーム画面のタイトル（h1）
  gameTitle: 'Wordleの電脳',

  // モード名
  modes: {
    daily: '今日のお題',
    challenge: 'チャレンジ',
    custom: 'カスタム',
  },

  // サブタイトル
  subtitle: {
    daily:     (len, max) => `今日のお題（かんたん・${len}文字）を${max}回以内に当てよう`,
    challenge: (len, max) => `チャレンジ（むずかしい・${len}文字）を${max}回以内に当てよう`,
    custom: (diffLabel, len, max) => `カスタム（${diffLabel}・${len}文字）を${max}回以内に当てよう`,
  },

  // 難易度ラベル
  difficulty: {
    easy: 'かんたん',
    hard: 'むずかしい',
  },

  // 連勝バー
  streak: {
    current: '連勝',
    best: '最高',
  },

  // 凡例
  legend: {
    correct: '正しい位置',
    present: '含まれるが位置が違う',
    absent: '含まれない',
  },

  // ゲーム結果バナー
  result: {
    won: '成功！',
    lost: '失敗',
    answerPrefix: '答えは',
    answerSuffixWon: 'でした！',
    answerSuffixLost: 'でした',
  },

  // ボタン類
  buttons: {
    tweet: 'ツイート',
    playAgain: 'もう一度プレイ',
    giveup: 'あきらめる',
    continue: '続ける',
    cancel: 'キャンセル',
    start: 'スタート',
  },

  // キーボードキーラベル
  keyboard: {
    reset: 'リセット',
    del: '⌫',
    enter: 'ENTER',
    giveup: 'あきらめる',
  },

  // あきらめる確認ダイアログ
  giveupConfirm: '本当にあきらめますか？',

  // 操作説明（<kbd>はtemplate側で描画）
  instructions: {
    prefix: '画面のキーボードからカタカナを入力',
    enterSuffix: 'で確定',
    backspaceSuffix: 'で削除',
  },

  // ツイートテキスト
  tweet: {
    urlBase: 'https://twitter.com/intent/tweet',
    hashtag: '#Wordleの電脳',
    resultWon: '成功！',
    resultLost: '失敗',
    tries: (n, max) => `${n}/${max}`,
    streak: (n) => `連勝${n}回`,
    modeLabel: (mode) => `${mode}モード`,
    emoji: {
      correct: '🟩',
      present: '🟨',
      absent: '⬛',
      unused: '⬜️',
    },
  },

  // カスタムモーダル
  modal: {
    title: 'カスタムモード設定',
    wordLength: '文字数',
    difficulty: '難易度',
    wordSets: '答えの単語セット',
    selectAll: '全選択',
    setLabel: (n) => `EXE${n}`,
    wordUnit: '語',
    warnNoSet: '少なくとも1つのセットを選択してください',
    warnNoWords: '選択したセットに対象の単語がありません',
    maxGuesses: '最大回答回数',
    triesUnit: '回以内',
  },

  // エラーメッセージ
  errors: {
    noInput: '文字を入力してください',
    invalidWord: '無効な入力です',
    emptyPool: '単語プールが空です。validwords.jsに単語を追加してください。',
  },

  // ヘルプモーダル
  help: {
    title: '収録内容について',
    body: `EXE1～6のライブラリに存在するチップまたはプログラムアドバンスを収録しています。
そのため、シンクロトリガーなどは回答に含まれていません（ゲーム中ライブラリに存在しないため）。
しかし便宜上、EXE1のプログラムアドバンスとEXE4のダークチップは収録しています（通常プレイで使用可能なため）。

例：
シグマソード：ある
ダークバルカン：ある
エレメントパワー：ない
ニードルアーム：ない

また、エグゼ4のナビチップSPとDSについては、二文字分使うのが正しいですが、一文字分にまとめています。`,
    close: '閉じる',
  },
}
