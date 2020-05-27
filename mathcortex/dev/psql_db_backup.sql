--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

SET search_path = public, pg_catalog;

DROP INDEX public.users_email_idx;
DROP INDEX public.autologin_username_idx;
DROP INDEX public.autologin_token_idx;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY public.pages DROP CONSTRAINT pages_pkey;
DROP SEQUENCE public.users_seq;
DROP TABLE public.users;
DROP SEQUENCE public.pages_seq;
DROP TABLE public.pages;
DROP TABLE public.loginstatus_sil;
DROP TABLE public.autologin;
DROP EXTENSION plpgsql;
DROP SCHEMA public;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: autologin; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE autologin (
    username character varying(255) NOT NULL,
    token character varying(255),
    issue_date date
);


ALTER TABLE public.autologin OWNER TO postgres;

--
-- Name: loginstatus_sil; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE loginstatus_sil (
    email character varying(255) NOT NULL,
    status integer NOT NULL,
    starttime timestamp with time zone
);


ALTER TABLE public.loginstatus_sil OWNER TO postgres;

--
-- Name: pages; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE pages (
    p_id integer NOT NULL,
    text character varying(65535),
    name character varying(255),
    is_dir boolean,
    owner_id integer
);


ALTER TABLE public.pages OWNER TO postgres;

--
-- Name: pages_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE pages_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pages_seq OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE users (
    p_id integer NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(255),
    pages character varying(1024),
    file_count integer
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: COLUMN users.pages; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN users.pages IS 'comma seperated page ids';


--
-- Name: users_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE users_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_seq OWNER TO postgres;

--
-- Data for Name: autologin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY autologin (username, token, issue_date) FROM stdin;
mathcortex@gmail.com	$2a$05$WhDknMeMTlWxcRIQVFfWmOG6Ihfj99OIv079VYx1IhSJHL8EQi8gy	2013-06-05
\.


--
-- Data for Name: loginstatus_sil; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY loginstatus_sil (email, status, starttime) FROM stdin;
n7q4osrn0t9qapj95l2nhlhkt4	0	2013-04-25 16:56:10.398+03
n7q4osrn0t9qapj95l2nhlhkt4	0	2013-04-25 16:55:10.552+03
\.


--
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY pages (p_id, text, name, is_dir, owner_id) FROM stdin;
105	ggg	ggg	f	1
133	M  = [2.655,  0.3959, 2.044;\n      0.9232, 3.959,  1.681;\n      2.488,  2.897,  1.076];\n\n[u s v] = svd(M);\n\ndisp(M - u*diag(s)*trans(v));\n	svd_ex2	f	1
188	speedy = rand(100,100);\nts=trans(speedy);\ns = inv(ts);	deneme2	f	1
118	/dd/ada/ggg	ggg	f	1
51	// Lorenz Attractor 466\niter = 1000;\n\nx=zeros(iter,1);\ny=zeros(iter,1);\nz=zeros(iter,1);\n\nalpha = 10;\nbeta = 8/3;\np = 28;\nx[0] = 0.01;\ndt = 0.01;\n\nloop(i, 0 , iter-1)\n{\n  xdot = alpha * (y[i] - x[i]);\n  ydot = x[i] * (p - z[i]) - y[i];\n  zdot = x[i] * y[i,0] - beta*z[i];\n\n  // integrate\n  x[i+1] = x[i] + dt * xdot;\n  y[i+1] = y[i] + dt * ydot;\n  z[i+1] = z[i] + dt * zdot;\n}\n\nplot(x,y);	hede466	f	1
108	102 108 109	nnxdsfs	t	1
109	asdasdas	gfgf	f	1
114	113 114	ada	t	18
115	ggg	new 1	f	18
113	113 113 114 115	/	t	18
44	// Lorenz Attractor 4\niter = 1000;\n\nx=zeros(iter,1);\ny=zeros(iter,1);\nz=zeros(iter,1);\n\nalpha = 10;\nbeta = 8/3;\np = 28;\nx[0] = 0.01;\ndt = 0.01;\n\nloop(i, 0 , iter-1)\n{\n  xdot = alpha * (y[i] - x[i]);\n  ydot = x[i] * (p - z[i]) - y[i];\n  zdot = x[i] * y[i,0] - beta*z[i];\n\n  // integrate\n  x[i+1] = x[i] + dt * xdot;\n  y[i+1] = y[i] + dt * ydot;\n  z[i+1] = z[i] + dt * zdot;\n}\n\nplot(x,y);	hede46	f	1
3	M  = [2.655,  0.3959, 2.044;\n      0.9232, 3.959,  1.681;\n      2.488,  2.897,  1.076];\n\n[u s v] = svd(M);\n\ndisp(M - u*diag(s)*trans(v));\n	svd_ex	f	1
50	// Lorenz Attractor 46\niter = 1000;\n\nx=zeros(iter,1);\ny=zeros(iter,1);\nz=zeros(iter,1);\n\nalpha = 10;\nbeta = 8/3;\np = 28;\nx[0] = 0.01;\ndt = 0.01;\n\nloop(i, 0 , iter-1)\n{\n  xdot = alpha * (y[i] - x[i]);\n  ydot = x[i] * (p - z[i]) - y[i];\n  zdot = x[i] * y[i,0] - beta*z[i];\n\n  // integrate\n  x[i+1] = x[i] + dt * xdot;\n  y[i+1] = y[i] + dt * ydot;\n  z[i+1] = z[i] + dt * zdot;\n}\n\nplot(x,y);	hede46	f	1
117	86 117 118	ada	t	1
199	geas	geasdasd	f	1
144	M  = [2.655,  0.3959, 2.044;\n      0.9232, 3.959,  1.681;\n      2.488,  2.897,  1.076];\n\n[u s v] = svd(M);\n\ndisp(M - u*diag(s)*trans(v));\n	y_svd_ex	f	1
201	M  = [2.655,  0.3959, 2.044;\n      0.9232, 3.959,  1.681;\n      2.488,  2.897,  1.076];\n\n[l v] = eig(M);\n\nv1 = [v[0,0], v[1,0], v[2,0]];\ndisp(M*trans(v1) - l[0,0]*trans(v1));\n\nv2 = [v[0,1], v[1,1], v[2,1]];\ndisp(M*trans(v2) - l[1,0]*trans(v2));\n\nv3 = [v[0,2], v[1,2], v[2,2]];\ndisp(M*trans(v3) - l[2,0]*trans(v3));	eig	f	19
200	200 200 201	/	t	19
202	202 202	/	t	20
203	203 203	/	t	21
86	 0 86 117	d33	t	1
204	geas	geasdasd2	f	1
0	 0 0 86 1 3 51 50 133 188 199 204	/	t	1
1	eig 	eig_ex2	f	1
\.


--
-- Name: pages_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('pages_seq', 204, true);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY users (p_id, email, username, pages, file_count) FROM stdin;
19	agencay@yahoo.com		200	\N
20	mathcortex4@gmail.com		202	0
21	mathcortex54@gmail.com		203	0
1	mathcortex@gmail.com		 0	11
\.


--
-- Name: users_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('users_seq', 21, true);


--
-- Name: pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (p_id);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (p_id);


--
-- Name: autologin_token_idx; Type: INDEX; Schema: public; Owner: postgres; Tablespace: 
--

CREATE INDEX autologin_token_idx ON autologin USING btree (token);


--
-- Name: autologin_username_idx; Type: INDEX; Schema: public; Owner: postgres; Tablespace: 
--

CREATE INDEX autologin_username_idx ON autologin USING btree (username);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: postgres; Tablespace: 
--

CREATE INDEX users_email_idx ON users USING btree (email);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

