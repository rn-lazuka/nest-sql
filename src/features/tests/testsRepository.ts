import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async deleteAllData(): Promise<void> {
    await this.dataSource.query(`
    CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR) RETURNS void AS $$
    DECLARE
    statements CURSOR FOR
        SELECT tablename FROM pg_tables
        WHERE tableowner = username AND schemaname = 'public';
    BEGIN
    FOR stmt IN statements LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
    END LOOP;
    END;
    $$ LANGUAGE plpgsql;
    `);

    await this.dataSource.query(`SELECT truncate_tables('sql_user')`);
    // todo add in query -     SELECT truncate_tables('sql_user');
  }
}
