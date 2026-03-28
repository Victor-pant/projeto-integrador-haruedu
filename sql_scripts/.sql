SELECT * FROM dbo.dados_ficticios_candidatos;

SELECT * FROM dbo.novos_dados;

SELECT * 
FROM dbo.Calendario;


-- Renomeando Coluna_1 para ID --

USE HARUEDU;
GO

EXEC sp_rename 'dbo.dados_ficticios_candidatos.coluna_1', 'ID', 'COLUMN';


-- Criando tabela Calendário --

USE HARUEDU;
GO

CREATE TABLE dbo.Calendario (
    DataKey INT PRIMARY KEY,
    Data DATE NOT NULL,
    Ano INT,
    Mes INT,
    Nome_Mes VARCHAR(15),
    Dia INT,
    Dia_Semana INT,
    Nome_Dia_Semana VARCHAR(15),
    Trimestre INT,
    Semestre INT
);

SELECT * 
FROM dbo.Calendario;

-- Adicionar dados na  tabela Calendário --
DECLARE @DataInicial DATE = '2023-01-01';
DECLARE @DataFinal DATE = '2026-12-31';

WHILE @DataInicial <= @DataFinal
BEGIN
    INSERT INTO dbo.Calendario (
        DataKey,
        Data,
        Ano,
        Mes,
        Nome_Mes,
        Dia,
        Dia_Semana,
        Nome_Dia_Semana,
        Trimestre,
        Semestre
    )
    VALUES (
        CAST(CONVERT(VARCHAR(8), @DataInicial, 112) AS INT), -- Ex: 20240101
        @DataInicial,
        YEAR(@DataInicial),
        MONTH(@DataInicial),
        DATENAME(MONTH, @DataInicial),
        DAY(@DataInicial),
        DATEPART(WEEKDAY, @DataInicial),
        DATENAME(WEEKDAY, @DataInicial),
        DATEPART(QUARTER, @DataInicial),
        CASE WHEN MONTH(@DataInicial) <= 6 THEN 1 ELSE 2 END
    );

    SET @DataInicial = DATEADD(DAY, 1, @DataInicial);
END;

-- Alterar para Português dados na  tabela Calendário --
USE HARUEDU;
GO

SET LANGUAGE 'Portuguese';

UPDATE dbo.Calendario
SET 
    Nome_Mes = DATENAME(MONTH, Data),
    Nome_Dia_Semana = DATENAME(WEEKDAY, Data);


-- Criando nova tabela temporária --

SELECT *
INTO temp_dados_candidatos
FROM dbo.dados_ficticios_candidatos
WHERE 1 = 0;

INSERT INTO dbo.dados_ficticios_candidatos
SELECT t.*
FROM temp_dados_candidatos t
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.dados_ficticios_candidatos d
    WHERE d.CPF = t.CPF
);


-- Adicionando mais dados ----


INSERT INTO dbo.dados_ficticios_candidatos
SELECT *
FROM dbo.novos_dados d
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.dados_ficticios_candidatos f
    WHERE f.CPF = d.CPF
);




SELECT * FROM dbo.dados_ficticios_candidatos;

SELECT *
FROM dbo.dados_ficticios_candidatos
WHERE Curso LIKE 'ADMINISTRAÇÃO%'
  AND Data_da_Inscrição BETWEEN '2025-10-01' AND '2026-02-18';


