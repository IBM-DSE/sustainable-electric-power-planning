# Sustainable Planning of Electrical Power Generation #

### Table of Contents ###
- [Introduction](#intro)
- [Application Design](#design)
- [Implementation](#impl)

## Introduction ##
<a id=intro ></a>

This project demonstrates how Predictive and Prescriptive models can be combined to support the complex process of planning the electrical power generation. One of the main challenges in the Energy & Electric Power Industry is obtaining effective production plans versus the uncertainty of demand and renewable generation. Here you can see how Machine Learning and Decision Optimization are leveraged to obtain effective business recommendations through multiple scenarios.

The predictive part of the project takes time series data in the form of electrical demand over the span of several years and trains and tests a model that is able to predict electrical demand into the future. This is implemented in two different ways to show how it can be done in both a drag-and-drop platform like SPSS, as well as writing code (python) in a Jupyter notebook. The first is an SPSS flow that trains a neural network model. The second is a python Jupyter notebook that trains an XGBoost Regressor model.

The Decision Optimization part of the project focuses on 3 different mathematical formulations of the Unit Commitment Problem, which are solved
and compared by using 
[IBM&reg; Decision Optimization (DO)](https://content-dsxlocal.mybluemix.net/docs/content/DODS/DODS_home.html) 
for [Data Science Experience (DSX) Local](https://content-dsxlocal.mybluemix.net/).

The project is composed by the following assets:
- Notebooks:
  - [`dem-predict-electrical-demand`](#notebook-dem-predict-electrical-demand)
  - [`uc-formulations`](#n-forms)
  - [`uc-opt-model-comparator`](#n-comp)
  - [`display-comparison-kpis`](#n-kpis)
- Predictive Model:
  - [`XGBoost Electrical Demand`](#predictive-model-xgboost-electrical-demand)
- SPSS Modeler Flow
  - Ercot Demand
- DO Model:
  - [`uc-models-comparison`](#domod)
- Datasets:
  - A collection of CSV files representing multiple instances of the Unit Commitment problem, 
  plus other files playing the integration between the project assets
  
  
## Application Design ##
<a id=design ></a>

The Prediction assets of the project are organized into datasets, notebooks, SPSS Modeler Flows and models. 
The dataset [ERCOT_Hourly_Load_Data_2002-2016.csv](datasets/ERCOT_Hourly_Load_Data_2002-2016.csv) is the historical data used for training and testing both the predictive notebook as well as the SPSS Flow. 
The notebook [`dem-predict-electrical-demand`](jupyter/dem-predict-electrical-demand.jupyter-py35.ipynb) trains on this data. 
It then saves the trained model as [`XGBoost Electrical Demand`](models/XGBoost%20Electrical%20Demand).
Finally it uses the model to predict electrical demand for 2016, saving the results to [ERCOT_Predictions_2016.csv](datasets/ERCOT_Predictions_2016.csv).
The SPSS Flow was constructed to closely match what the predictive notebook does. It trains and tests the model on the same data. We used a Neural Net model node here instead of using XGBoost to show something different. it then saves the results to ERCOT_Predictions_2016_SPSS.csv

The Decision Optimization assets of the project give rise to a configurable framework to solve iteratively different formulations of the Unit Commitment 
over multiple instances of the problem. The Optimization results arsing from the different scenarios are collected and 
processed in order to visualize precise business recommendations, as well as summary KPIs that compare the quality of solutions
through an ex-post analysis. <br /> 


## Implementation ##
<a id=impl ></a>

The implementation is based on SPSS Modeler Flows, Jupyter notebooks with Python 2.7 and 3.5, and DO Models for DSX. The main project assets 
are described in the following.

### SPSS Modeler Flow ERCOT Demand

Uses [Electrical Demand data](http://www.ercot.com/gridinfo/load/load_hist/) from the [Electric Reliability Council of Texas](http://www.ercot.com/) 
to predict future demand using [Neural Network](https://www.ibm.com/support/knowledgecenter/en/SS3RA7_18.1.1/modeler_mainhelp_client_ddita/clementine/trainnetnode_general.html). 
Trains model using [ERCOT_Hourly_Load_Data_2002-2016.csv](datasets/ERCOT_Hourly_Load_Data_2002-2016.csv) for the years 2002-2015.
Predicts hourly electrical load for 2016, writing to [ERCOT_Predictions_2016_SPSS.csv](datasets/ERCOT_Predictions_2016_SPSS.csv).

### Notebook [`dem-predict-electrical-demand`](jupyter/dem-predict-electrical-demand.jupyter-py35.ipynb)

Uses [Electrical Demand data](http://www.ercot.com/gridinfo/load/load_hist/) from the [Electric Reliability Council of Texas](http://www.ercot.com/) 
to predict future demand using [XGBRegressor](https://xgboost.readthedocs.io/en/latest/python/python_api.html#xgboost.XGBRegressor). 
Trains model using [ERCOT_Hourly_Load_Data_2002-2016.csv](datasets/ERCOT_Hourly_Load_Data_2002-2016.csv) for the years 2002-2015.
Predicts hourly electrical load for 2016, writing to [ERCOT_Predictions_2016.csv](datasets/ERCOT_Predictions_2016.csv).

### Notebook [`uc-formulations`](jupyter/uc-formulations.jupyter.ipynb) ###
<a id=n-forms ></a>

This notebook implements 3 different Optimization approaches to the Unit Commitment problem. Each approach leads to a 
mixed-integer linear program that is modeled and solved with 
[IBM&reg; DO CPLEX&reg; Modeling for Python](https://developer.ibm.com/docloud/documentation/optimization-modeling/modeling-for-python/): 
[`docplex`](https://pypi.org/project/docplex/). The addressed formulations are described and discussed within the notebook.
The associated Python script is imported into the DO Model `uc-models-comparison`.

### Notebook [`uc-opt-model-comparator`](jupyter/uc-opt-model-comparator.jupyter.ipynb) ###
<a id=n-comp ></a>

This notebook orchestrates the overall application. It allows to select one or more Optimization models implemented in
the notebook `uc-formulations`, then it allows to set up the desired problem instances to be solved. Hence, it executes the 
configured Optimization jobs by managing the DO Model `uc-models-comparison` with the DSX Python APIs 
[`dd_scenario`](https://ibmdecisionoptimization.github.io/dd-scenario-api-doc/). Finally, summary results produced by the 
Optimization runs are collected and stored in a CSV file, which is consumed by the notebook `display-comparison-kpis`.

### Notebook [`display-comparison-kpis`](jupyter/display-comparison-kpis.jupyter.ipynb) ###
<a id=n-kpis ></a>

This notebook consumes the produced results to prepare the data and visualize summary charts. These charts compare 
performance and solution quality of different Optimization models across multiple instances of the problem. Relevant 
business KPIs are displayed by `matplotlib` charts in order to analyze the Optimization behaviour according to an ex-post 
analysis.

### Predictive Model [`XGBoost Electrical Demand`](models/XGBoost%20Electrical%20Demand)

This predictive model is trained using XGBoost Regressor and is trained on electrical demand time series data. 
It is able to predict future electrical demand data. 
See the notebook [`dem-predict-electrical-demand`](jupyter/dem-predict-electrical-demand.jupyter-py35.ipynb) for model creation details.

### DO Model `uc-models-comparison` ###
<a id=domod ></a>

This DO Model handles the Optimization approaches implemented in the notebook `uc-formulations`. It is managed by the
notebook `uc-opt-model-comparator` (it can be used interactively as well). In particular, a DO Scenario is created for each 
selected formulation, then it is iteratively updated when a new instance of the problem has to be prepared and solved. This 
DO Model contains also a dashboard that reports precise business recommendations for each scenario, and a summary chart 
comparing cost KPIs across its multiple scenarios.
