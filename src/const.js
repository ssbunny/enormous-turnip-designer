
export const REGEXPS =  {

    /*
     * Note that sheet name in Excel must not exceed 31 characters
     * and must not contain any of the any of the following characters:
     *    - 0x0000
     *    - 0x0003
     *    - colon (:)
     *    - backslash (\)
     *    - asterisk (*)
     *    - question mark (?)
     *    - forward slash (/)
     *    - opening square bracket ([)
     *    - closing square bracket (])
     */
    sheetName: /[\\/\?\*\[\]'"]/  // sheet name 不包含
};


export const WARNS = {

    S1: `工作表名不能为空白。`,
    S2: `工作表名称包含无效字符: : \ / ? * [ ]。`,
    S3: `该名称已被使用，请尝试其他名称。`

};