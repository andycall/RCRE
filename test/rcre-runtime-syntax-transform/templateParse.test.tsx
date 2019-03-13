import {templateParse} from 'rcre-runtime-syntax-transform';

describe('模板字符串处理', () => {
    it('字符串模式', () => {
        let code = '$data.flag ? \'[ wqd ]${CPM}[ qwd  qwd]\' : true';
        expect(templateParse(code).code).toBe('$data.flag ? (\'[ wqd ]\' + CPM + \'[ qwd  qwd]\') : true');
    });

    it('点属性访问', () => {
        let code = '$data.${NAME}.${AGE}[SOME]';
        expect(templateParse(code).code).toBe('$data[NAME][AGE][SOME]');
    });

    it('其他情况', () => {
        let code = '#ES{getCreationItems(\n' +
            '                        checkboxHasSel([\n' +
            '                            ${config.plan} ? $data.planDownCheckbox : false,\n' +
            '                            ${config.unit} ? $data.unitDownCheckbox : false,\n' +
            '                            false\n' +
            '                        ]), hasPermission(\'gd_download_creations_playdata_show\')\n' +
            '                    )}';
        expect(templateParse(code).code).toBe(
            '#ES{getCreationItems(\n' +
            '                        checkboxHasSel([\n' +
            '                            config.plan ? $data.planDownCheckbox : false,\n' +
            '                            config.unit ? $data.unitDownCheckbox : false,\n' +
            '                            false\n' +
            '                        ]), hasPermission(\'gd_download_creations_playdata_show\')\n' +
            '                    )}'
        );

        expect(templateParse('1234').code).toBe('1234');
    });

    it('字符串 + 点属性访问', () => {
        let code = '"${CPM}" helloworld $data.${NAME}';
        expect(templateParse(code).code).toBe('(\'\' + CPM + \'\') helloworld $data[NAME]');
    });

    it('字符串 + 其他情况', () => {
        let code = '$data.flag ? "${KEY}" : ${TIME}';
        expect(templateParse(code).code).toBe('$data.flag ? (\'\' + KEY + \'\') : TIME');
    });

    it('字符串 + 点属性访问 + 其他情况', () => {
        let code = '$data.${KEY} + "${KEY}" + ${TIME}';
        expect(templateParse(code).code).toBe('$data[KEY] + (\'\' + KEY + \'\') + TIME');
    });

    it('多重字符串组合的形式', () => {
        let code = '$data.sales_type !== "-1"\n                && $data.mode === \'${CPM}\'\n                && !/1481698145541|1481698231751/.test($data.place_id)\n                && $data.special_mode !== "${ORDER_CHASE}"';
        expect(templateParse(code).code).toBe('$data.sales_type !== "-1"\n                && $data.mode === (\'\' + CPM + \'\')\n                && !/1481698145541|1481698231751/.test($data.place_id)\n                && $data.special_mode !== (\'\' + ORDER_CHASE + \'\')');
    });

    it('啥也没有的情况', () => {
        let code = '#ES{formatDwonloadData(\n' +
            '                        {\n' +
            '                            cmd: 8,\n' +
            '                            elem: $data.elem || "0",\n' +
            '                            "data[name]": $data.name || "",\n' +
            '                            "data[id]": $data.id || "",\n' +
            '                            "data[idList]": $data.idList || "",\n' +
            '                            "data[status]": $data.status || "",\n' +
            '                            "data[pdb_cid]": $data.pdb || ""\n' +
            '                        },\n' +
            '                        $data.planDownCheckbox,\n' +
            '                        $data.unitDownCheckbox,\n' +
            '                        $data.creationDownCheckbox,\n' +
            '                        {\n' +
            '                            startTime: $moment($data.startTime).unix(),\n' +
            '                            endTime: $moment($data.endTime).unix(),\n' +
            '                            dateTimeAll: $data.dateTimeAll\n' +
            '                        }\n' +
            '                    )}';
        expect(templateParse(code).code).toBe('#ES{formatDwonloadData(\n' +
            '                        {\n' +
            '                            cmd: 8,\n' +
            '                            elem: $data.elem || "0",\n' +
            '                            "data[name]": $data.name || "",\n' +
            '                            "data[id]": $data.id || "",\n' +
            '                            "data[idList]": $data.idList || "",\n' +
            '                            "data[status]": $data.status || "",\n' +
            '                            "data[pdb_cid]": $data.pdb || ""\n' +
            '                        },\n' +
            '                        $data.planDownCheckbox,\n' +
            '                        $data.unitDownCheckbox,\n' +
            '                        $data.creationDownCheckbox,\n' +
            '                        {\n' +
            '                            startTime: $moment($data.startTime).unix(),\n' +
            '                            endTime: $moment($data.endTime).unix(),\n' +
            '                            dateTimeAll: $data.dateTimeAll\n' +
            '                        }\n' +
            '                    )}');
    });

    it('点属性访问 + 其他情况', () => {
        let code = '`$data.${KEY} + ${TIME}`';
        expect(templateParse(code).code).toBe('`$data[KEY] + TIME`');
    });
});