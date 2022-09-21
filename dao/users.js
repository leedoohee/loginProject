
import getCamelcase from '../utils/camelCase.js';

const dao = {
    getUsersById: async function (conn, id){

        const sql = ` 
            select 
                email, 
                nickname, 
                cellnumber, 
                name
            from users 
            where 
                id = $1;
        `;
    
        const result = await conn.q(sql, [id]);
        return getCamelcase(result);
    },
    getUserIdsById : async function(conn, id) {
        const sql = `
            select 
                row_to_json(b)
            from (
                select 
                    a.id,
                    ids
                from (
                    select
                        u1.id as id,
                        combinations(array[password, name]) as remainder_column,
                        combinations(array[password, name]) || u2.identifier_column as ids
                    from 
                        users u1
                        left outer join(
                            select
                                id,
                                combinations(array[email, nickname, cellnumber]) as identifier_column
                            from users
                        ) u2 on  u1.id = u2.id
                    where 
                        u1.id = $1
                )a
                where 
                    not (((a.ids @> a.remainder_column) AND (a.remainder_column <@ a.ids) 
                    and (coalesce(array_length(a.ids, 1), 0) = coalesce(array_length(a.remainder_column, 1), 0))))
            )b
        `;

        const result = await conn.q(sql, [id]);
        return getCamelcase(result);
    },
    insertUser: async function (conn, userInfo) {
        const sql = ` 
        insert into users (
            email, 
            nickname, 
            cellnumber, 
            name, 
            password
        ) 
        values (
            $1, 
            $2, 
            $3, 
            $4, 
            $5
        )
        RETURNING id
        `;
    
        const result = await conn.q(sql, [userInfo.email, userInfo.nickname, userInfo.cellnumber, userInfo.name, userInfo.password]);
        return result;
    },
    updatePassword: async function(conn, userInfo){
        const sql = ` 
            update users
            set password = $1
            where
                id = $2
        `;

        const result = await conn.q(sql, [userInfo.password, userInfo.id]);
        return result;
    }
};

export default dao;